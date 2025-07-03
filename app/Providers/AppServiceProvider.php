<?php

namespace App\Providers;

use App\Services\FileUploadService;
use App\Services\PluginService;
use App\Services\ThemeService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register core services
        $this->app->singleton(FileUploadService::class);
        $this->app->singleton(PluginService::class);
        $this->app->singleton(ThemeService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}