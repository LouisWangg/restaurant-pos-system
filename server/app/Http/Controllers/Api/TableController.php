<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RestaurantTableService;
use Illuminate\Http\JsonResponse;

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
}
