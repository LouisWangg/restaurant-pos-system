<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RestaurantTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        for ($i = 1; $i <= 24; $i++) {
            RestaurantTable::create([
                'table_number' => $i,
                'status' => 'available'
            ]);
        }
    }
}
