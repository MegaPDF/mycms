<?php

use Illuminate\Support\Facades\Route;
use Plugins\HelloWorldPlugin\Controllers\HelloWorldController;

Route::prefix('api/plugins/hello-world-plugin')
    ->name('api.hello-world-plugin.')
    ->middleware(['api'])
    ->group(function () {
        Route::get('/data', [HelloWorldController::class, 'apiData'])->name('data');
        Route::get('/dashboard', [HelloWorldController::class, 'apiDashboard'])->name('dashboard');
        Route::get('/status', [HelloWorldController::class, 'status'])->name('status');
        Route::get('/test', [HelloWorldController::class, 'test'])->name('test');
        Route::post('/messages', [HelloWorldController::class, 'store'])->name('store');
    });