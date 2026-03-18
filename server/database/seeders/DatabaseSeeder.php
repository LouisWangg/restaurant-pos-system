<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Kasir Spesifik
        User::updateOrCreate(
            ['email' => 'kasir@gmail.com'],
            [
                'name' => 'Kasir POS',
                'role' => 'Kasir',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
            ]
        );

        // Pelayan Spesifik
        User::updateOrCreate(
            ['email' => 'pelayan@gmail.com'],
            [
                'name' => 'Pelayan POS',
                'role' => 'Pelayan',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
            ]
        );

        $this->call([
            RestaurantTableSeeder::class,
            FoodSeeder::class,
        ]);
    }
}
