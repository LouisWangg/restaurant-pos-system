<?php

use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\FoodController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/tables', [TableController::class, 'index']);
Route::get('/tables/{restaurantTable}', [TableController::class, 'show']);
Route::patch('/tables/{restaurantTable}/status', [TableController::class, 'updateStatus']);
// Read-only: semua bisa akses list makanan (untuk order page)
Route::get('/foods', [FoodController::class, 'index']);

// Write operations: hanya Pelayan
Route::middleware(['auth:sanctum', 'role:Pelayan'])->group(function () {
    Route::post('/foods', [FoodController::class, 'store']);
    Route::put('/foods/{food}', [FoodController::class, 'update']);
    Route::patch('/foods/{food}', [FoodController::class, 'update']);
    Route::delete('/foods/{food}', [FoodController::class, 'destroy']);
});

require __DIR__.'/auth.php';
