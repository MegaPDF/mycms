<?php

namespace App\Providers;

use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ServiceProvider;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class PluginServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(PluginService::class);

        // Register active plugins
        $this->registerActivePlugins();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadActivePluginProviders();
        $this->loadActivePluginRoutes();
        $this->loadActivePluginViews();
        $this->loadActivePluginTranslations();
        $this->loadActivePluginMigrations();
        $this->publishActivePluginAssets();
    }

    /**
     * Register active plugins.
     */
    protected function registerActivePlugins(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $this->registerPlugin($plugin);
        }
    }

    /**
     * Register a specific plugin.
     */
    protected function registerPlugin(Plugin $plugin): void
    {
        $pluginPath = Storage::disk('local')->path($plugin->file_path);

        if (!File::exists($pluginPath)) {
            return;
        }

        // Register plugin's service provider if exists
        $providerPath = $pluginPath . '/src/Providers/' . ucfirst($plugin->slug) . 'ServiceProvider.php';
        if (File::exists($providerPath)) {
            $providerClass = "Plugins\\{$plugin->slug}\\Providers\\" . ucfirst($plugin->slug) . 'ServiceProvider';

            if (class_exists($providerClass)) {
                $this->app->register($providerClass);
            }
        }

        // Register plugin configuration
        $this->registerPluginConfig($plugin, $pluginPath);
    }

    /**
     * Register plugin configuration.
     */
    protected function registerPluginConfig(Plugin $plugin, string $pluginPath): void
    {
        $configPath = $pluginPath . '/config';

        if (!File::isDirectory($configPath)) {
            return;
        }

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($configPath));

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $config = str_replace($configPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $configKey = str_replace([DIRECTORY_SEPARATOR, '.php'], ['.', ''], $config);
                $fullKey = "plugins.{$plugin->slug}.{$configKey}";

                $this->mergeConfigFrom($file->getPathname(), $fullKey);
            }
        }
    }

    /**
     * Load active plugin service providers.
     */
    protected function loadActivePluginProviders(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $providersPath = $pluginPath . '/src/Providers';

            if (File::isDirectory($providersPath)) {
                $files = File::allFiles($providersPath);

                foreach ($files as $file) {
                    if ($file->getExtension() === 'php') {
                        $className = $file->getBasename('.php');
                        $providerClass = "Plugins\\{$plugin->slug}\\Providers\\{$className}";

                        if (
                            class_exists($providerClass) &&
                            is_subclass_of($providerClass, ServiceProvider::class)
                        ) {
                            $this->app->register($providerClass);
                        }
                    }
                }
            }
        }
    }

    /**
     * Load active plugin routes.
     */
    protected function loadActivePluginRoutes(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $routesPath = $pluginPath . '/routes';

            if (File::isDirectory($routesPath)) {
                // Load web routes
                $webRoutesFile = $routesPath . '/web.php';
                if (File::exists($webRoutesFile)) {
                    $this->loadRoutesFrom($webRoutesFile);
                }

                // Load API routes
                $apiRoutesFile = $routesPath . '/api.php';
                if (File::exists($apiRoutesFile)) {
                    $this->loadRoutesFrom($apiRoutesFile);
                }
            }
        }
    }

    /**
     * Load active plugin views.
     */
    protected function loadActivePluginViews(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $viewsPath = $pluginPath . '/resources/views';

            if (File::isDirectory($viewsPath)) {
                $this->loadViewsFrom($viewsPath, "plugin-{$plugin->slug}");
            }
        }
    }

    /**
     * Load active plugin translations.
     */
    protected function loadActivePluginTranslations(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $langPath = $pluginPath . '/resources/lang';

            if (File::isDirectory($langPath)) {
                $this->loadTranslationsFrom($langPath, "plugin-{$plugin->slug}");
                $this->loadJsonTranslationsFrom($langPath);
            }
        }
    }

    /**
     * Load active plugin migrations.
     */
    protected function loadActivePluginMigrations(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $migrationsPath = $pluginPath . '/database/migrations';

            if (File::isDirectory($migrationsPath)) {
                $this->loadMigrationsFrom($migrationsPath);
            }
        }
    }

    /**
     * Publish active plugin assets.
     */
    protected function publishActivePluginAssets(): void
    {
        $activePlugins = Plugin::where('is_active', true)->get();

        foreach ($activePlugins as $plugin) {
            $pluginPath = Storage::disk('local')->path($plugin->file_path);
            $assetsPath = $pluginPath . '/resources/assets';
            $publicPath = public_path("plugins/{$plugin->slug}");

            if (File::isDirectory($assetsPath) && !File::exists($publicPath)) {
                File::copyDirectory($assetsPath, $publicPath);
            }
        }
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [
            PluginService::class,
        ];
    }
}