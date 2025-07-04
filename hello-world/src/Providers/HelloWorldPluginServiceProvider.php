<?php

namespace Plugins\HelloWorldPlugin\Providers;

use Illuminate\Support\ServiceProvider;
use Plugins\HelloWorldPlugin\Services\HelloWorldService;

class HelloWorldPluginServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register plugin service
        $this->app->singleton(HelloWorldService::class);

        // Bind plugin service to container with plugin slug
        $this->app->bind('hello-world-plugin', function ($app) {
            return $app->make(HelloWorldService::class);
        });

        // Merge plugin configuration
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/hello.php',
            'plugins.hello-world-plugin'
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Only boot if plugin is active
        if (!$this->isPluginActive()) {
            return;
        }

        // Load views with namespace
        $this->loadViewsFrom(
            __DIR__ . '/../../resources/views',
            'hello-world-plugin'
        );

        // Load routes - FIXED: Call routes in boot method
        $this->loadRoutes();

        // Publish assets
        $this->publishes([
            __DIR__ . '/../../resources/assets' => public_path('plugins/hello-world-plugin'),
        ], 'hello-world-plugin-assets');

        // Publish config
        $this->publishes([
            __DIR__ . '/../../config/hello.php' => config_path('plugins/hello-world-plugin.php'),
        ], 'hello-world-plugin-config');
    }

    /**
     * Load plugin routes.
     */
    protected function loadRoutes(): void
    {
        // Load web routes
        $webRoutesPath = __DIR__ . '/../../routes/web.php';
        if (file_exists($webRoutesPath)) {
            $this->loadRoutesFrom($webRoutesPath);
        }

        // Load API routes  
        $apiRoutesPath = __DIR__ . '/../../routes/api.php';
        if (file_exists($apiRoutesPath)) {
            $this->loadRoutesFrom($apiRoutesPath);
        }
    }

    /**
     * Check if this plugin is active.
     */
    protected function isPluginActive(): bool
    {
        try {
            // Check if plugin exists and is active in database
            if (class_exists(\App\Models\Plugin::class)) {
                $plugin = \App\Models\Plugin::where('slug', 'hello-world-plugin')->first();
                return $plugin && $plugin->is_active;
            }
        } catch (\Exception $e) {
            // If there's any error checking, assume inactive
            return false;
        }

        return false;
    }
}