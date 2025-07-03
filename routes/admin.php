<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\PluginController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ThemeController;
use App\Http\Controllers\Api\PluginController as ApiPluginController;
use App\Http\Controllers\Api\ThemeController as ApiThemeController;
use Illuminate\Support\Facades\Route;

// Admin Web Routes
Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Redirect /admin to dashboard
    Route::redirect('/', '/admin/dashboard');

    // Plugins Management
    Route::get('/plugins', [PluginController::class, 'index'])->name('plugins.index');
    Route::put('/plugins/{plugin}/toggle', [PluginController::class, 'toggle'])->name('plugins.toggle');
    Route::delete('/plugins/{plugin}', [PluginController::class, 'destroy'])->name('plugins.destroy');

    // Themes Management
    Route::get('/themes', [ThemeController::class, 'index'])->name('themes.index');
    Route::put('/themes/{theme}/activate', [ThemeController::class, 'activate'])->name('themes.activate');
    Route::delete('/themes/{theme}', [ThemeController::class, 'destroy'])->name('themes.destroy');

    // Settings Management
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');
});

// Admin API Routes
Route::prefix('api')->name('api.')->middleware(['auth', 'role:admin,super_admin'])->group(function () {

    // Plugin API Routes
    Route::prefix('plugins')->name('plugins.')->group(function () {
        Route::get('/', [ApiPluginController::class, 'index'])->name('index');
        Route::post('/upload', [ApiPluginController::class, 'upload'])->name('upload');
        Route::get('/{plugin}', [ApiPluginController::class, 'show'])->name('show');
        Route::put('/{plugin}/toggle', [ApiPluginController::class, 'toggle'])->name('toggle');
        Route::delete('/{plugin}', [ApiPluginController::class, 'destroy'])->name('destroy');
    });

    // Theme API Routes
    Route::prefix('themes')->name('themes.')->group(function () {
        Route::get('/', [ApiThemeController::class, 'index'])->name('index');
        Route::post('/upload', [ApiThemeController::class, 'upload'])->name('upload');
        Route::get('/{theme}', [ApiThemeController::class, 'show'])->name('show');
        Route::put('/{theme}/activate', [ApiThemeController::class, 'activate'])->name('activate');
        Route::delete('/{theme}', [ApiThemeController::class, 'destroy'])->name('destroy');
    });
});