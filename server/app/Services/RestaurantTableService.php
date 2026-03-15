<?php

namespace App\Services;

use App\Models\RestaurantTable;

class RestaurantTableService
{
    /**
     * Ambil semua data meja dari database
     */
    public function getAllTables()
    {
        return RestaurantTable::orderBy('table_number', 'asc')->get();
    }
}
