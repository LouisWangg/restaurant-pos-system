<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\RestaurantTable;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OrderService
{
    /**
     * Membuat pesanan baru beserta itemnya
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            // 1. Check if there's an active 'open' order for this table
            $order = Order::where('table_id', $data['table_id'])
                ->where('status', 'open')
                ->first();

            if ($order) {
                // Update existing order
                $order->update([
                    'total_price' => $data['total_price'],
                ]);
            } else {
                // Create new order
                $orderNumber = $this->generateOrderNumber();
                $order = Order::create([
                    'order_number' => $orderNumber,
                    'table_id' => $data['table_id'],
                    'opened_by' => $data['user_id'],
                    'status' => 'open',
                    'total_price' => $data['total_price'],
                    'opened_at' => Carbon::now(),
                ]);
            }

            // 2. Handle Order Items
            foreach ($data['items'] as $itemData) {
                // Logic: 
                // - Jika item memiliki id, berarti item lama yang perlu diupdate (misal qty/note).
                // - Jika item tidak memiliki id, berarti item baru ('new').
                
                if (isset($itemData['id'])) {
                    $item = OrderItem::find($itemData['id']);
                    // Safeguard: Jika item sudah cancelled, jangan diupdate tapi buat baru
                    if ($item && $item->status !== 'cancelled') {
                        $item->update([
                            'qty' => $itemData['qty'],
                            'note' => $itemData['note'] ?? null,
                            'status' => $data['item_status'], // Update status to 'confirmed' if clicked Send to Kitchen
                        ]);
                    } else {
                        // Create new record if item doesn't exist or is cancelled
                        OrderItem::create([
                            'order_id' => $order->id,
                            'food_id' => $itemData['food_id'],
                            'qty' => $itemData['qty'],
                            'price' => $itemData['price'],
                            'note' => $itemData['note'] ?? null,
                            'status' => $data['item_status'],
                        ]);
                    }
                } else {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'food_id' => $itemData['food_id'],
                        'qty' => $itemData['qty'],
                        'price' => $itemData['price'],
                        'note' => $itemData['note'] ?? null,
                        'status' => $data['item_status'],
                    ]);
                }
            }

            // 3. Update Table Status to 'occupied'
            $table = RestaurantTable::find($data['table_id']);
            if ($table) {
                $table->status = 'occupied';
                $table->save();
            }

            return $order->load('items.food');
        });
    }

    /**
     * Update order item status
     */
    public function updateOrderItemStatus(int $id, string $status)
    {
        $item = OrderItem::find($id);
        if (!$item) {
            throw new \Exception('Order item not found');
        }

        $item->status = $status;
        $item->save();

        // Recalculate Order total_price
        $order = Order::find($item->order_id);
        if ($order) {
            $newTotal = OrderItem::where('order_id', $order->id)
                ->where('status', '!=', 'cancelled')
                ->sum(DB::raw('qty * price'));
            
            $order->total_price = $newTotal;
            $order->save();
        }

        return $item;
    }

    /**
     * Generate running order number: ORD-YYYYMMDD-XXXX
     */
    private function generateOrderNumber()
    {
        $date = Carbon::now()->format('Ymd');
        $prefix = "ORD-{$date}-";

        // Cari nomor terakhir hari ini
        $lastOrder = Order::where('order_number', 'like', "{$prefix}%")
            ->orderBy('order_number', 'desc')
            ->first();

        if ($lastOrder) {
            $lastSequence = (int) substr($lastOrder->order_number, -4);
            $newSequence = str_pad($lastSequence + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newSequence = '0001';
        }

        return $prefix . $newSequence;
    }

    public function closeOrder(int $orderId, int $userId)
    {
        $order = Order::findOrFail($orderId);
        
        $order->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closed_by' => $userId,
        ]);

        // Release the table
        $order->table->update(['status' => 'available']);

        return $order;
    }
}
