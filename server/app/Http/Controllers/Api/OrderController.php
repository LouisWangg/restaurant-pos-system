<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
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
            'table_id' => 'required|exists:restaurant_tables,id',
            'items' => 'required|array|min:1',
            'items.*.food_id' => 'required|exists:foods,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|integer',
            'items.*.note' => ['nullable', 'string', 'regex:/^[a-zA-Z0-9\s.,\/()]*$/'],
            'item_status' => 'required|in:draft,confirmed',
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
}
