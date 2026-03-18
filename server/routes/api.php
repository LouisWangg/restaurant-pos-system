<?php

use App\Http\Controllers\Api\TableController;
use App\Http\Controllers\Api\FoodController;
use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/tables', [TableController::class, 'index']);
Route::get('/tables/{restaurantTable}', [TableController::class, 'show']);
Route::patch('/tables/{restaurantTable}/status', [TableController::class, 'updateStatus']);
Route::get('/foods', [FoodController::class, 'index']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::post('/orders/{order}/close', [OrderController::class, 'close']);
    Route::patch('/order-items/{id}/status', [OrderController::class, 'updateItemStatus']);
    Route::post('/foods', [FoodController::class, 'store']);
    Route::put('/foods/{food}', [FoodController::class, 'update']);
    Route::delete('/foods/{food}', [FoodController::class, 'destroy']);
});

require __DIR__ . '/auth.php';
