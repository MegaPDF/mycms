<?php

use Illuminate\Support\Facades\Route;
use Plugins\SampleTestPlugin\Controllers\SampleController;

Route::prefix('api/plugins/sample-test-plugin')
    ->name('api.sample-test-plugin.')
    ->middleware(['api'])
    ->group(function () {
        Route::get('/data', [SampleController::class, 'apiData'])->name('data');
        Route::post('/samples', [SampleController::class, 'store'])->name('store');
        Route::get('/status', [SampleController::class, 'status'])->name('status');
        Route::get('/test', [SampleController::class, 'test'])->name('test');
    });