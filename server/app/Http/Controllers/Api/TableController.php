<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use App\Services\RestaurantTableService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TableController extends Controller
{
    protected $tableService;

    public function __construct(RestaurantTableService $tableService)
    {
        $this->tableService = $tableService;
    }

    /**
     * Mendapatkan daftar semua meja
     */
    public function index(): JsonResponse
    {
        $tables = $this->tableService->getAllTables();
        
        return response()->json([
            'status' => 'success',
            'data' => $tables
        ]);
    }

    /**
     * Mendapatkan detail satu meja berdasarkan ID
     */
    public function show(RestaurantTable $restaurantTable): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => $restaurantTable
        ]);
    }

    /**
     * Memperbarui status meja
     */
    public function updateStatus(Request $request, RestaurantTable $restaurantTable): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:available,occupied,reserved,inactive'
        ]);

        $updatedTable = $this->tableService->updateStatus($restaurantTable, $request->status);

        return response()->json([
            'status' => 'success',
            'data' => $updatedTable
        ]);
    }
}
