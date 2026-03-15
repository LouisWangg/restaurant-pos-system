<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $foods = [
            [
                'name' => 'Nasi Goreng Spesial',
                'description' => 'Nasi goreng dengan telur, ayam, dan kerupuk.',
                'price' => 25000,
                'type' => 'main_course'
            ],
            [
                'name' => 'Mie Goreng Jawa',
                'description' => 'Mie goreng dengan bumbu khas Jawa dan sayuran.',
                'price' => 23000,
                'type' => 'main_course'
            ],
            [
                'name' => 'Ayam Bakar Madu',
                'description' => 'Ayam bakar dengan saus madu manis gurih.',
                'price' => 30000,
                'type' => 'main_course'
            ],
            [
                'name' => 'Sate Ayam',
                'description' => 'Sate ayam dengan bumbu kacang dan lontong.',
                'price' => 28000,
                'type' => 'main_course'
            ],
            [
                'name' => 'Nasi Ayam Geprek',
                'description' => 'Ayam goreng tepung dengan sambal pedas.',
                'price' => 26000,
                'type' => 'main_course'
            ],
            [
                'name' => 'Lumpia Goreng',
                'description' => 'Lumpia goreng isi sayur dengan saus manis.',
                'price' => 15000,
                'type' => 'appetizer'
            ],
            [
                'name' => 'Tahu Crispy',
                'description' => 'Tahu goreng renyah dengan saus sambal.',
                'price' => 14000,
                'type' => 'appetizer'
            ],
            [
                'name' => 'Kentang Goreng',
                'description' => 'Kentang goreng renyah dengan saus tomat.',
                'price' => 16000,
                'type' => 'appetizer'
            ],
            [
                'name' => 'Es Krim Vanilla',
                'description' => 'Es krim vanilla lembut dan manis.',
                'price' => 12000,
                'type' => 'dessert'
            ],
            [
                'name' => 'Puding Coklat',
                'description' => 'Puding coklat lembut dengan saus coklat.',
                'price' => 13000,
                'type' => 'dessert'
            ],
            [
                'name' => 'Pisang Goreng',
                'description' => 'Pisang goreng hangat dengan topping gula.',
                'price' => 14000,
                'type' => 'dessert'
            ],

            [
                'name' => 'Es Teh Manis',
                'description' => 'Teh manis dingin segar.',
                'price' => 8000,
                'type' => 'beverage'
            ],
            [
                'name' => 'Es Jeruk',
                'description' => 'Minuman jeruk segar dengan es.',
                'price' => 10000,
                'type' => 'beverage'
            ],
            [
                'name' => 'Kopi Hitam',
                'description' => 'Kopi hitam panas khas Indonesia.',
                'price' => 12000,
                'type' => 'beverage'
            ],
            [
                'name' => 'Jus Alpukat',
                'description' => 'Jus alpukat segar dengan susu coklat.',
                'price' => 15000,
                'type' => 'beverage'
            ],
            [
                'name' => 'Air Mineral',
                'description' => 'Air mineral botol.',
                'price' => 6000,
                'type' => 'beverage'
            ],
            [
                'name' => 'Salad Sayur Segar',
                'description' => 'Campuran sayuran segar dengan dressing.',
                'price' => 18000,
                'type' => 'salad'
            ],
            [
                'name' => 'Salad Buah',
                'description' => 'Potongan buah segar dengan saus mayones.',
                'price' => 20000,
                'type' => 'salad'
            ],
        ];

        foreach ($foods as $food) {
            Food::create($food);
        }
    }
}
