<?php

use Illuminate\Support\Facades\Route;
use Plugins\SampleTestPlugin\Controllers\SampleController;
use Plugins\SampleTestPlugin\Middleware\SampleMiddleware;

Route::prefix('plugins/sample-test-plugin')
    ->name('sample-test-plugin.')
    ->middleware(['web', SampleMiddleware::class])
    ->group(function () {
        Route::get('/', [SampleController::class, 'index'])->name('index');
        Route::get('/dashboard', [SampleController::class, 'dashboard'])->name('dashboard');
    });