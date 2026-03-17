<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'table_id',
        'opened_by',
        'closed_by',
        'status',
        'total_price',
        'opened_at',
        'closed_at'
    ];

    public function table()
    {
        return $this->belongsTo(RestaurantTable::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
