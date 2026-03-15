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
Route::middleware(['auth:sanctum', 'role:Pelayan'])->group(function () {
    Route::apiResource('foods', FoodController::class);
});

require __DIR__.'/auth.php';
