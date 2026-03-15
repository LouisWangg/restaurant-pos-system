<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 3 Kasir
        User::factory(3)->create([
            'role' => 'Kasir',
        ]);

        // 7 Pelayan
        User::factory(7)->create([
            'role' => 'Pelayan',
        ]);

        // Optional: Satu user spesifik untuk tes login
        User::factory()->create([
            'name' => 'Admin POS',
            'email' => 'admin@pos.com',
            'role' => 'Kasir',
        ]);

        $this->call([
            RestaurantTableSeeder::class,
        ]);

        $this->call([
            FoodSeeder::class,
        ]);
    }
}
