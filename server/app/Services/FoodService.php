<?php

namespace App\Services;

use App\Models\Food;
use App\Services\OrderService;

class FoodService
{
    /**
     * Mendapatkan semua menu makanan berurutan berdasarkan prioritas tipe dan nama.
     */
    public function getAllFoods()
    {
        return Food::orderByRaw("CASE 
                WHEN type = 'appetizer' THEN 1 
                WHEN type = 'main_course' THEN 2 
                WHEN type = 'dessert' THEN 3 
                WHEN type = 'beverage' THEN 4 
                WHEN type = 'salad' THEN 5 
                ELSE 6 END")
            ->orderBy('name')
            ->get();
    }

    /**
     * Membuat menu makanan baru.
     */
    public function createFood(array $data)
    {
        return Food::create($data);
    }

    /**
     * Memperbarui menu makanan yang sudah ada.
     */
    public function updateFood(Food $food, array $data)
    {
        $oldPrice = $food->price;
        $food->update($data);

        if (isset($data['price']) && (float)$data['price'] !== (float)$oldPrice) {
            app(OrderService::class)->syncFoodPrice($food->id, (float)$data['price']);
        }

        return $food;
    }

    /**
     * Menghapus menu makanan.
     */
    public function deleteFood(Food $food)
    {
        return $food->delete();
    }
}
