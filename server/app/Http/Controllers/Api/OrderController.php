<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Menyimpan pesanan baru
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'nullable|exists:orders,id',
            'table_id' => 'required|exists:restaurant_tables,id',
            'items' => 'required|array|min:1',
            'items.*.id' => 'nullable|exists:order_items,id',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric',
            'items.*.note' => ['nullable', 'string', 'regex:/^[a-zA-Z0-9\s.,\/()]*$/'],
            'item_status' => 'required|in:draft,confirmed',
            'total_price' => 'required|numeric',
        ]);

        try {
            $data = $request->all();
            $data['user_id'] = Auth::id();
            
            // Hitung total harga jika belum dilempar dari depan atau untuk validasi
            $totalPrice = 0;
            foreach ($request->items as $item) {
                $totalPrice += $item['price'] * $item['qty'];
            }
            $data['total_price'] = $totalPrice;

            $order = $this->orderService->createOrder($data);

            return response()->json([
                'status' => 'success',
                'message' => 'Pesanan berhasil dibuat',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat pesanan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status item pesanan (misal: cancel)
     */
    public function updateItemStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:draft,confirmed,cancelled',
        ]);

        try {
            $item = $this->orderService->updateOrderItemStatus($id, $request->status);

            return response()->json([
                'status' => 'success',
                'message' => 'Status item berhasil diperbarui',
                'data' => $item
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui status item: ' . $e->getMessage()
            ], 500);
        }
    }

    public function close(Order $order)
    {
        try {
            $this->orderService->closeOrder($order->id, Auth::id());
            return response()->json([
                'status' => 'success',
                'message' => 'Order successfully closed'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to close order: ' . $e->getMessage()
            ], 500);
        }
    }
}
