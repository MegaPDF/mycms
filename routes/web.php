<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});
// Add these temporary diagnostic routes to routes/web.php

Route::get('/debug/plugin-check/{plugin}', function (\App\Models\Plugin $plugin) {
    if (!auth()->check() || !auth()->user()->hasRole(['admin', 'super_admin'])) {
        abort(403);
    }

    $diagnostics = [
        'plugin_info' => [
            'id' => $plugin->id,
            'slug' => $plugin->slug,
            'name' => $plugin->name,
            'is_active' => $plugin->is_active,
            'file_path' => $plugin->file_path,
        ],
        'file_system' => [],
        'service_resolution' => [],
        'routes' => [],
        'class_loading' => []
    ];

    // Check file system
    $pluginPath = \Illuminate\Support\Facades\Storage::disk('local')->path($plugin->file_path);
    $diagnostics['file_system'] = [
        'plugin_path' => $pluginPath,
        'path_exists' => \Illuminate\Support\Facades\File::exists($pluginPath),
        'plugin_json_exists' => \Illuminate\Support\Facades\File::exists($pluginPath . '/plugin.json'),
        'src_dir_exists' => \Illuminate\Support\Facades\File::isDirectory($pluginPath . '/src'),
        'providers_dir_exists' => \Illuminate\Support\Facades\File::isDirectory($pluginPath . '/src/Providers'),
        'services_dir_exists' => \Illuminate\Support\Facades\File::isDirectory($pluginPath . '/src/Services'),
        'routes_dir_exists' => \Illuminate\Support\Facades\File::isDirectory($pluginPath . '/routes'),
        'web_routes_exists' => \Illuminate\Support\Facades\File::exists($pluginPath . '/routes/web.php'),
        'api_routes_exists' => \Illuminate\Support\Facades\File::exists($pluginPath . '/routes/api.php'),
    ];

    // Check plugin.json content
    if ($diagnostics['file_system']['plugin_json_exists']) {
        try {
            $pluginJson = json_decode(\Illuminate\Support\Facades\File::get($pluginPath . '/plugin.json'), true);
            $diagnostics['plugin_json'] = $pluginJson;
        } catch (\Exception $e) {
            $diagnostics['plugin_json_error'] = $e->getMessage();
        }
    }

    // Check service resolution
    $diagnostics['service_resolution'] = [
        'slug_bound' => app()->bound($plugin->slug),
        'resolved_service' => null,
        'service_methods' => []
    ];

    if (app()->bound($plugin->slug)) {
        try {
            $service = app($plugin->slug);
            $diagnostics['service_resolution']['resolved_service'] = get_class($service);
            $diagnostics['service_resolution']['service_methods'] = get_class_methods($service);
        } catch (\Exception $e) {
            $diagnostics['service_resolution']['resolution_error'] = $e->getMessage();
        }
    }

    // Check class loading
    if (isset($pluginJson)) {
        $providers = $pluginJson['extra']['laravel']['providers'] ?? [];
        foreach ($providers as $providerClass) {
            $diagnostics['class_loading']['providers'][$providerClass] = class_exists($providerClass);

            // Check corresponding service class
            $serviceClass = str_replace('Providers\\', 'Services\\', $providerClass);
            $serviceClass = str_replace('ServiceProvider', 'Service', $serviceClass);
            $diagnostics['class_loading']['services'][$serviceClass] = class_exists($serviceClass);
        }
    }

    // Check routes
    $routes = \Illuminate\Support\Facades\Route::getRoutes();
    $pluginRoutes = [];

    foreach ($routes as $route) {
        if (str_contains($route->uri(), "plugins/{$plugin->slug}")) {
            $pluginRoutes[] = [
                'uri' => $route->uri(),
                'methods' => $route->methods(),
                'name' => $route->getName(),
                'action' => $route->getActionName()
            ];
        }
    }

    $diagnostics['routes'] = $pluginRoutes;

    return response()->json($diagnostics, 200, [], JSON_PRETTY_PRINT);
})->name('debug.plugin-check');

Route::get('/debug/plugin-providers', function () {
    if (!auth()->check() || !auth()->user()->hasRole(['admin', 'super_admin'])) {
        abort(403);
    }

    $diagnostics = [
        'registered_providers' => [],
        'plugin_check' => [],
        'autoloader_check' => []
    ];

    // Get all registered service providers
    $app = app();
    $providers = $app->getLoadedProviders();

    foreach ($providers as $provider => $loaded) {
        if (str_contains($provider, 'Plugin') || str_contains($provider, 'HelloWorld')) {
            $diagnostics['registered_providers'][$provider] = $loaded;
        }
    }

    // Check specific plugin
    $plugin = \App\Models\Plugin::where('slug', 'hello-world-plugin')->first();
    if ($plugin) {
        $diagnostics['plugin_check'] = [
            'plugin_exists' => true,
            'is_active' => $plugin->is_active,
            'file_path' => $plugin->file_path,
            'provider_class' => 'Plugins\\HelloWorldPlugin\\Providers\\HelloWorldPluginServiceProvider',
            'provider_exists' => class_exists('Plugins\\HelloWorldPlugin\\Providers\\HelloWorldPluginServiceProvider'),
            'service_class' => 'Plugins\\HelloWorldPlugin\\Services\\HelloWorldService',
            'service_exists' => class_exists('Plugins\\HelloWorldPlugin\\Services\\HelloWorldService'),
        ];

        // Check if service is bound
        $diagnostics['plugin_check']['service_bound'] = app()->bound('hello-world-plugin');

        // Try to resolve service
        if (app()->bound('hello-world-plugin')) {
            try {
                $service = app('hello-world-plugin');
                $diagnostics['plugin_check']['service_resolved'] = [
                    'class' => get_class($service),
                    'methods' => get_class_methods($service)
                ];

                // Try to call getPluginData
                if (method_exists($service, 'getPluginData')) {
                    $data = $service->getPluginData();
                    $diagnostics['plugin_check']['service_data'] = $data;
                }
            } catch (\Exception $e) {
                $diagnostics['plugin_check']['service_error'] = $e->getMessage();
            }
        }

        // Check autoloader
        $pluginPath = \Illuminate\Support\Facades\Storage::disk('local')->path($plugin->file_path);
        $composerAutoload = base_path('vendor/composer/autoload_psr4.php');

        if (file_exists($composerAutoload)) {
            $autoloadPsr4 = include $composerAutoload;
            $diagnostics['autoloader_check']['psr4_registered'] = isset($autoloadPsr4['Plugins\\HelloWorldPlugin\\']);

            if (isset($autoloadPsr4['Plugins\\HelloWorldPlugin\\'])) {
                $diagnostics['autoloader_check']['psr4_path'] = $autoloadPsr4['Plugins\\HelloWorldPlugin\\'];
            }
        }

        // Check if PluginServiceProvider is registering plugins correctly
        $diagnostics['main_plugin_provider'] = [
            'exists' => class_exists('App\\Providers\\PluginServiceProvider'),
            'is_registered' => isset($providers['App\\Providers\\PluginServiceProvider'])
        ];

    } else {
        $diagnostics['plugin_check'] = ['plugin_exists' => false];
    }

    return response()->json($diagnostics, 200, [], JSON_PRETTY_PRINT);
})->name('debug.plugin-providers');
Route::get('/debug/test-plugin-api/{plugin}', function (\App\Models\Plugin $plugin) {
    if (!auth()->check() || !auth()->user()->hasRole(['admin', 'super_admin'])) {
        abort(403);
    }

    $endpoints = [
        'data' => "/api/plugins/{$plugin->slug}/data",
        'status' => "/api/plugins/{$plugin->slug}/status",
        'test' => "/api/plugins/{$plugin->slug}/test"
    ];

    $results = [];

    foreach ($endpoints as $name => $endpoint) {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(5)->get(url($endpoint));
            $results[$name] = [
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'successful' => $response->successful(),
                'data' => $response->successful() ? $response->json() : $response->body()
            ];
        } catch (\Exception $e) {
            $results[$name] = [
                'endpoint' => $endpoint,
                'error' => $e->getMessage()
            ];
        }
    }

    return response()->json($results, 200, [], JSON_PRETTY_PRINT);
})->name('debug.test-plugin-api');
// Include separate route files
require __DIR__ . '/settings.php';
require __DIR__ . '/admin.php';
require __DIR__ . '/auth.php';