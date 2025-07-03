<?php

namespace App\Providers;

use App\Models\Theme;
use App\Services\ThemeService;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class ThemeServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ThemeService::class);

        // Register active theme
        $this->registerActiveTheme();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->loadActiveThemeViews();
        $this->loadActiveThemeTranslations();
        $this->loadActiveThemeConfig();
        $this->publishActiveThemeAssets();
        $this->registerThemeViewComposer();
        $this->registerThemeBladeDirectives();
    }

    /**
     * Register active theme.
     */
    protected function registerActiveTheme(): void
    {
        $activeTheme = Theme::getActive();

        if ($activeTheme) {
            $this->registerTheme($activeTheme);
        }
    }

    /**
     * Register a specific theme.
     */
    protected function registerTheme(Theme $theme): void
    {
        $themePath = Storage::disk('local')->path($theme->file_path);

        if (!File::exists($themePath)) {
            return;
        }

        // Register theme's service provider if exists
        $providerPath = $themePath . '/src/Providers/' . ucfirst($theme->slug) . 'ThemeProvider.php';
        if (File::exists($providerPath)) {
            $providerClass = "Themes\\{$theme->slug}\\Providers\\" . ucfirst($theme->slug) . 'ThemeProvider';

            if (class_exists($providerClass)) {
                $this->app->register($providerClass);
            }
        }

        // Set theme as global variable
        config(['app.active_theme' => $theme]);
    }

    /**
     * Load active theme views.
     */
    protected function loadActiveThemeViews(): void
    {
        $activeTheme = Theme::getActive();

        if (!$activeTheme) {
            return;
        }

        $themePath = Storage::disk('local')->path($activeTheme->file_path);
        $viewsPath = $themePath . '/resources/views';

        if (File::isDirectory($viewsPath)) {
            // Register theme views with highest priority
            View::prependNamespace('theme', $viewsPath);

            // Also register with theme-specific namespace
            $this->loadViewsFrom($viewsPath, "theme-{$activeTheme->slug}");

            // Override default views if they exist in theme
            $this->overrideDefaultViews($viewsPath);
        }
    }

    /**
     * Override default views with theme views.
     */
    protected function overrideDefaultViews(string $viewsPath): void
    {
        $defaultViewsPath = resource_path('views');
        $themeViewFiles = File::allFiles($viewsPath);

        foreach ($themeViewFiles as $file) {
            $relativePath = str_replace($viewsPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
            $viewName = str_replace([DIRECTORY_SEPARATOR, '.blade.php'], ['.', ''], $relativePath);

            // Check if this view exists in default views
            $defaultViewPath = $defaultViewsPath . DIRECTORY_SEPARATOR . $relativePath;
            if (File::exists($defaultViewPath)) {
                // Register theme view with higher priority
                View::replaceNamespace('theme-override', [$viewsPath]);
            }
        }
    }

    /**
     * Load active theme translations.
     */
    protected function loadActiveThemeTranslations(): void
    {
        $activeTheme = Theme::getActive();

        if (!$activeTheme) {
            return;
        }

        $themePath = Storage::disk('local')->path($activeTheme->file_path);
        $langPath = $themePath . '/resources/lang';

        if (File::isDirectory($langPath)) {
            $this->loadTranslationsFrom($langPath, "theme-{$activeTheme->slug}");
            $this->loadJsonTranslationsFrom($langPath);
        }
    }

    /**
     * Load active theme configuration.
     */
    protected function loadActiveThemeConfig(): void
    {
        $activeTheme = Theme::getActive();

        if (!$activeTheme) {
            return;
        }

        $themePath = Storage::disk('local')->path($activeTheme->file_path);
        $configPath = $themePath . '/config';

        if (!File::isDirectory($configPath)) {
            return;
        }

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($configPath));

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $config = str_replace($configPath . DIRECTORY_SEPARATOR, '', $file->getPathname());
                $configKey = str_replace([DIRECTORY_SEPARATOR, '.php'], ['.', ''], $config);
                $fullKey = "themes.{$activeTheme->slug}.{$configKey}";

                $this->mergeConfigFrom($file->getPathname(), $fullKey);
            }
        }
    }

    /**
     * Publish active theme assets.
     */
    protected function publishActiveThemeAssets(): void
    {
        $activeTheme = Theme::getActive();

        if (!$activeTheme) {
            return;
        }

        $themePath = Storage::disk('local')->path($activeTheme->file_path);
        $assetsPath = $themePath . '/resources/assets';
        $publicPath = public_path("themes/{$activeTheme->slug}");

        if (File::isDirectory($assetsPath)) {
            // Only copy if assets don't exist or theme was updated
            if (!File::exists($publicPath) || $this->shouldUpdateAssets($activeTheme)) {
                if (File::exists($publicPath)) {
                    File::deleteDirectory($publicPath);
                }
                File::copyDirectory($assetsPath, $publicPath);

                // Mark assets as updated
                cache()->put("theme_assets_updated_{$activeTheme->id}", time(), 3600);
            }
        }
    }

    /**
     * Check if theme assets should be updated.
     */
    protected function shouldUpdateAssets(Theme $theme): bool
    {
        $lastUpdated = cache()->get("theme_assets_updated_{$theme->id}", 0);
        return $theme->updated_at->timestamp > $lastUpdated;
    }

    /**
     * Register theme view composer.
     */
    protected function registerThemeViewComposer(): void
    {
        View::composer('*', function ($view) {
            $activeTheme = Theme::getActive();
            $view->with('activeTheme', $activeTheme);

            if ($activeTheme) {
                $view->with('themeConfig', $activeTheme->config);
                $view->with('themeAssets', "/themes/{$activeTheme->slug}");
            }
        });
    }

    /**
     * Register theme-specific Blade directives.
     */
    protected function registerThemeBladeDirectives(): void
    {
        // @theme directive to get current theme
        Blade::directive('theme', function () {
            return "<?php echo config('app.active_theme')?->slug ?? 'default'; ?>";
        });

        // @themeAsset directive for theme assets
        Blade::directive('themeAsset', function ($expression) {
            return "<?php echo asset('themes/' . (config('app.active_theme')?->slug ?? 'default') . '/' . {$expression}); ?>";
        });

        // @themeConfig directive to get theme configuration
        Blade::directive('themeConfig', function ($expression) {
            return "<?php echo config('app.active_theme')?->getConfigValue({$expression}) ?? ''; ?>";
        });

        // @hasTheme directive to check if theme is active
        Blade::directive('hasTheme', function ($expression) {
            return "<?php if(config('app.active_theme') && config('app.active_theme')->slug === {$expression}): ?>";
        });

        Blade::directive('endhasTheme', function () {
            return "<?php endif; ?>";
        });

        // @themeView directive to include theme-specific views
        Blade::directive('themeView', function ($expression) {
            return "<?php echo view()->exists('theme::' . {$expression}) ? 
                view('theme::' . {$expression})->render() : 
                (view()->exists({$expression}) ? view({$expression})->render() : ''); ?>";
        });
    }

    /**
     * Get the services provided by the provider.
     */
    public function provides(): array
    {
        return [
            ThemeService::class,
        ];
    }
}