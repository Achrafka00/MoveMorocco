<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone');
            $table->string('pickup');
            $table->string('dropoff');
            $table->date('date');
            $table->time('time')->nullable();
            $table->integer('passengers');
            $table->string('vehicleType')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('pending');
            $table->decimal('price', 10, 2)->default(0);
            $table->boolean('commission_paid')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
