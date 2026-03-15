<?php

namespace App\Services;

use App\Models\Food;

class FoodService
{
    /**
     * Get all foods ordered by specific type priority and name.
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
     * Create a new food item.
     */
    public function createFood(array $data)
    {
        return Food::create($data);
    }

    /**
     * Update an existing food item.
     */
    public function updateFood(Food $food, array $data)
    {
        $food->update($data);
        return $food;
    }

    /**
     * Delete a food item.
     */
    public function deleteFood(Food $food)
    {
        return $food->delete();
    }
}
