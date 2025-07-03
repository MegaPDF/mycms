<?php

namespace Plugins\SampleTestPlugin\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Plugins\SampleTestPlugin\Services\SampleService;

class SampleTestPluginServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register plugin services
        $this->app->singleton(SampleService::class);

        // Bind plugin service to container
        $this->app->bind('sample-test-plugin', function ($app) {
            return $app->make(SampleService::class);
        });

        // Merge plugin configuration
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/sample.php',
            'plugins.sample-test-plugin'
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Load views with namespace
        $this->loadViewsFrom(
            __DIR__ . '/../../resources/views',
            'sample-test-plugin'
        );

        // Load translations
        $this->loadTranslationsFrom(
            __DIR__ . '/../../resources/lang',
            'sample-test-plugin'
        );

        // Load migrations
        $this->loadMigrationsFrom(__DIR__ . '/../../database/migrations');

        // Load routes
        $this->loadRoutes();

        // Publish assets
        $this->publishes([
            __DIR__ . '/../../resources/assets' => public_path('plugins/sample-test-plugin'),
        ], 'sample-test-plugin-assets');

        // Publish config
        $this->publishes([
            __DIR__ . '/../../config/sample.php' => config_path('plugins/sample-test-plugin.php'),
        ], 'sample-test-plugin-config');
    }

    /**
     * Load plugin routes.
     */
    protected function loadRoutes(): void
    {
        $this->loadRoutesFrom(__DIR__ . '/../../routes/web.php');
        $this->loadRoutesFrom(__DIR__ . '/../../routes/api.php');
    }
}