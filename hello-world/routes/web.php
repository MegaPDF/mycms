<?php

use Illuminate\Support\Facades\Route;
use Plugins\HelloWorldPlugin\Controllers\HelloWorldController;

Route::prefix('plugins/hello-world-plugin')
    ->name('hello-world-plugin.')
    ->middleware(['web'])
    ->group(function () {
        Route::get('/', [HelloWorldController::class, 'index'])->name('index');
        Route::get('/dashboard', [HelloWorldController::class, 'dashboard'])->name('dashboard');
    });