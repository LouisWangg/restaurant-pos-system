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
            // 1. Periksa apakah ada pesanan 'open' yang aktif untuk meja ini
            $order = Order::where('table_id', $data['table_id'])
                ->where('status', 'open')
                ->first();

            if ($order) {
                // Update pesanan yang ada
                $order->update([
                    'total_price' => $data['total_price'],
                ]);
            } else {
                // Buat pesanan baru
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

            // 2. Tangani Item Pesanan
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
                            'status' => $data['item_status'], // Update status ke 'confirmed' jika tombol Kirim ke Dapur diklik
                        ]);
                    } else {
                        // Buat data baru jika item tidak ditemukan atau statusnya cancelled
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

            // 3. Update Status Meja menjadi 'occupied'
            $table = RestaurantTable::find($data['table_id']);
            if ($table) {
                $table->status = 'occupied';
                $table->save();
            }

            return $order->load('items.food');
        });
    }

    /**
     * Memperbarui status item pesanan
     */
    public function updateOrderItemStatus(int $id, string $status)
    {
        $item = OrderItem::find($id);
        if (!$item) {
            throw new \Exception('Order item not found');
        }

        $item->status = $status;
        $item->save();

        // Hitung ulang total_price pesanan
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
     * Menghasilkan nomor pesanan baru: ORD-YYYYMMDD-XXXX
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

        // Lepaskan meja (set ke available)
        $order->table->update(['status' => 'available']);

        return $order;
    }

    /**
     * Mendapatkan semua pesanan dengan filter pencarian dan status opsional
     */
    public function getAllOrders($search = null, $status = null)
    {
        $query = Order::with(['table', 'items.food']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('table', function ($t) use ($search) {
                        $t->where('table_number', 'like', "%{$search}%");
                    });
            });
        }

        // Urutkan berdasarkan status (open dulu) kemudian created_at terbaru
        return $query->orderByRaw("status = 'open' DESC")
            ->orderBy('created_at', 'DESC')
            ->get();
    }

    /**
     * Mendapatkan data pesanan berdasarkan ID beserta detailnya
     */
    public function getOrderById(int $id)
    {
        return Order::with(['table', 'items.food', 'user'])->findOrFail($id);
    }

    /**
     * Sinkronisasi harga menu di semua pesanan yang masih 'open'
     */
    public function syncFoodPrice(int $foodId, float $newPrice)
    {
        $affectedOrderIds = OrderItem::where('food_id', $foodId)
            ->whereHas('order', function ($query) {
                $query->where('status', 'open');
            })
            ->pluck('order_id')
            ->unique();

        if ($affectedOrderIds->isEmpty()) {
            return;
        }

        OrderItem::where('food_id', $foodId)
            ->whereIn('order_id', $affectedOrderIds)
            ->update(['price' => $newPrice]);

        foreach ($affectedOrderIds as $orderId) {
            $newTotal = OrderItem::where('order_id', $orderId)
                ->where('status', '!=', 'cancelled')
                ->sum(DB::raw('qty * price'));

            Order::where('id', $orderId)->update(['total_price' => $newTotal]);
        }
    }
}
