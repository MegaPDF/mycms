<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PluginController extends BaseController
{
    protected PluginService $pluginService;

    public function __construct(PluginService $pluginService)
    {
        $this->pluginService = $pluginService;
        $this->middleware(['auth', 'admin']);
    }

    public function index(): Response
    {
        $plugins = Plugin::orderBy('name')->get();

        return Inertia::render('admin/plugins', [
            'plugins' => $plugins,
        ]);
    }

    /**
     * Show plugin details page
     */
    public function show(Plugin $plugin): Response
    {
        Log::info("=== PLUGIN SHOW DEBUG START ===");
        Log::info("Plugin being shown:", [
            'id' => $plugin->id,
            'slug' => $plugin->slug,
            'name' => $plugin->name,
            'is_active' => $plugin->is_active,
            'file_path' => $plugin->file_path
        ]);

        try {
            $pluginInfo = $this->pluginService->getPluginInfo($plugin);
            Log::info("Plugin info retrieved:", $pluginInfo);

            Log::info("=== PLUGIN SHOW DEBUG END ===");

            return Inertia::render('admin/plugin-detail', [
                'plugin' => array_merge($plugin->toArray(), ['info' => $pluginInfo]),
            ]);
        } catch (\Exception $e) {
            Log::error("Error in plugin show:", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Show plugin interface (admin-wrapped plugin view) - FIXED VERSION
     */
    public function interface(Plugin $plugin): Response|RedirectResponse
    {
        Log::info("=== PLUGIN INTERFACE DEBUG START ===");
        Log::info("Plugin interface requested:", [
            'id' => $plugin->id,
            'slug' => $plugin->slug,
            'name' => $plugin->name,
            'is_active' => $plugin->is_active,
            'file_path' => $plugin->file_path
        ]);

        // Check if plugin is active
        if (!$plugin->is_active) {
            Log::warning("Plugin is not active, redirecting back");
            return back()->with('error', 'Plugin must be active to view interface');
        }

        try {
            // Get plugin info from plugin.json
            Log::info("Getting plugin info...");
            $pluginInfo = $this->pluginService->getPluginInfo($plugin);
            Log::info("Plugin info retrieved:", $pluginInfo);

            // Try to get additional runtime data dynamically
            Log::info("Getting plugin runtime data...");
            $pluginData = $this->getPluginRuntimeDataFixed($plugin);
            Log::info("Plugin runtime data retrieved:", $pluginData);

            Log::info("=== PLUGIN INTERFACE DEBUG END ===");

            return Inertia::render('admin/plugin-interface', [
                'plugin' => $plugin,
                'pluginInfo' => $pluginInfo,
                'pluginData' => $pluginData,
            ]);

        } catch (\Exception $e) {
            Log::error("Error in plugin interface:", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response instead of throwing
            return back()->with('error', 'Failed to load plugin interface: ' . $e->getMessage());
        }
    }

    /**
     * Show plugin dashboard (admin-wrapped plugin dashboard) - FIXED VERSION
     */
    public function dashboard(Plugin $plugin): Response|RedirectResponse
    {
        Log::info("=== PLUGIN DASHBOARD DEBUG START ===");
        Log::info("Plugin dashboard requested:", [
            'id' => $plugin->id,
            'slug' => $plugin->slug,
            'name' => $plugin->name,
            'is_active' => $plugin->is_active
        ]);

        // Check if plugin is active
        if (!$plugin->is_active) {
            Log::warning("Plugin is not active, redirecting back");
            return back()->with('error', 'Plugin must be active to view dashboard');
        }

        try {
            // Get plugin info
            Log::info("Getting plugin info...");
            $pluginInfo = $this->pluginService->getPluginInfo($plugin);
            Log::info("Plugin info retrieved:", $pluginInfo);

            // Try to get dashboard data dynamically
            Log::info("Getting plugin dashboard data...");
            $dashboardData = $this->getPluginDashboardDataFixed($plugin);
            Log::info("Plugin dashboard data retrieved:", $dashboardData);

            Log::info("=== PLUGIN DASHBOARD DEBUG END ===");

            return Inertia::render('admin/plugin-dashboard', [
                'plugin' => $plugin,
                'pluginInfo' => $pluginInfo,
                'dashboardData' => $dashboardData,
            ]);

        } catch (\Exception $e) {
            Log::error("Error in plugin dashboard:", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Return error response instead of throwing
            return back()->with('error', 'Failed to load plugin dashboard: ' . $e->getMessage());
        }
    }

    /**
     * FIXED VERSION - Get plugin runtime data with better service resolution
     */
    protected function getPluginRuntimeDataFixed(Plugin $plugin): array
    {
        Log::info("=== GET PLUGIN RUNTIME DATA FIXED ===");
        Log::info("Starting runtime data retrieval for plugin: {$plugin->slug}");

        $pluginInfo = $this->pluginService->getPluginInfo($plugin);
        Log::info("Plugin info for runtime data:", $pluginInfo);

        // Method 1: Try multiple service resolution patterns
        Log::info("Method 1: Trying enhanced service resolution...");
        try {
            $data = $this->tryResolvePluginServiceFixed($plugin, $pluginInfo);
            if (!empty($data)) {
                Log::info("SUCCESS: Got data via enhanced service resolution", ['data_keys' => array_keys($data)]);
                return $data;
            }
            Log::info("Method 1 failed: No data from enhanced service resolution");
        } catch (\Exception $e) {
            Log::error("Method 1 error: " . $e->getMessage());
        }

        // Method 2: Try plugin API call
        Log::info("Method 2: Trying plugin API call...");
        try {
            $data = $this->tryPluginApiCallFixed($plugin);
            if (!empty($data)) {
                Log::info("SUCCESS: Got data via API call", ['data_keys' => array_keys($data)]);
                return $data;
            }
            Log::info("Method 2 failed: No data from API call");
        } catch (\Exception $e) {
            Log::error("Method 2 error: " . $e->getMessage());
        }

        // Method 3: Try plugin configuration
        Log::info("Method 3: Trying plugin configuration...");
        try {
            $data = $this->getPluginConfigDataFixed($plugin, $pluginInfo);
            if (!empty($data)) {
                Log::info("SUCCESS: Got data via configuration", ['data_keys' => array_keys($data)]);
                return $data;
            }
            Log::info("Method 3 failed: No data from configuration");
        } catch (\Exception $e) {
            Log::error("Method 3 error: " . $e->getMessage());
        }

        // Method 4: Fallback data
        Log::info("Method 4: Using fallback data...");
        $fallbackData = $this->getFallbackPluginDataFixed($plugin, $pluginInfo);
        Log::info("Fallback data generated:", $fallbackData);

        return $fallbackData;
    }
    /**
     * Get plugin file structure and contents
     */
    public function getFiles(Plugin $plugin, Request $request): JsonResponse
    {
        try {
            $path = $request->get('path', '');
            $pluginPath = Storage::disk('local')->path($plugin->file_path);

            if (!File::exists($pluginPath)) {
                return response()->json(['error' => 'Plugin directory not found'], 404);
            }

            $fullPath = $pluginPath . '/' . ltrim($path, '/');

            // Security check - ensure path is within plugin directory
            if (!str_starts_with(realpath($fullPath) ?: $fullPath, realpath($pluginPath))) {
                return response()->json(['error' => 'Access denied'], 403);
            }

            if (!File::exists($fullPath)) {
                return response()->json(['error' => 'Path not found'], 404);
            }

            if (File::isDirectory($fullPath)) {
                // Return directory listing
                $items = [];
                $files = File::glob($fullPath . '/*');

                foreach ($files as $file) {
                    $relativePath = str_replace($pluginPath . '/', '', $file);
                    $isDirectory = File::isDirectory($file);

                    $items[] = [
                        'name' => basename($file),
                        'path' => $relativePath,
                        'type' => $isDirectory ? 'directory' : 'file',
                        'size' => $isDirectory ? null : File::size($file),
                        'modified' => File::lastModified($file),
                        'extension' => $isDirectory ? null : File::extension($file),
                        'readable' => File::isReadable($file),
                    ];
                }

                // Sort: directories first, then files
                usort($items, function ($a, $b) {
                    if ($a['type'] !== $b['type']) {
                        return $a['type'] === 'directory' ? -1 : 1;
                    }
                    return strcmp($a['name'], $b['name']);
                });

                return response()->json([
                    'type' => 'directory',
                    'path' => $path,
                    'items' => $items
                ]);
            } else {
                // Return file content (for text files only)
                $extension = File::extension($fullPath);
                $textExtensions = ['php', 'js', 'css', 'json', 'md', 'txt', 'xml', 'yml', 'yaml', 'env'];

                if (in_array($extension, $textExtensions) && File::size($fullPath) < 1024 * 1024) { // Max 1MB
                    $content = File::get($fullPath);

                    return response()->json([
                        'type' => 'file',
                        'path' => $path,
                        'name' => basename($fullPath),
                        'extension' => $extension,
                        'size' => File::size($fullPath),
                        'modified' => File::lastModified($fullPath),
                        'content' => $content,
                        'readable' => true
                    ]);
                } else {
                    return response()->json([
                        'type' => 'file',
                        'path' => $path,
                        'name' => basename($fullPath),
                        'extension' => $extension,
                        'size' => File::size($fullPath),
                        'modified' => File::lastModified($fullPath),
                        'content' => null,
                        'readable' => false,
                        'reason' => 'File is too large or not a text file'
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error("Error getting plugin files: " . $e->getMessage());
            return response()->json(['error' => 'Unable to read plugin files'], 500);
        }
    }
    /**
     * FIXED VERSION - Try multiple service resolution patterns
     */
    protected function tryResolvePluginServiceFixed(Plugin $plugin, array $pluginInfo): array
    {
        Log::info("Trying enhanced service resolution for: {$plugin->slug}");

        // Pattern 1: Check if bound by plugin slug
        Log::info("Pattern 1: Checking app binding for slug: {$plugin->slug}");
        if (app()->bound($plugin->slug)) {
            Log::info("Service bound to slug, resolving...");
            try {
                $service = app($plugin->slug);
                Log::info("Service resolved via slug:", [
                    'class' => get_class($service),
                    'methods' => get_class_methods($service)
                ]);

                if (method_exists($service, 'getPluginData')) {
                    Log::info("Calling getPluginData on bound service...");
                    $data = $service->getPluginData();
                    Log::info("getPluginData returned:", $data);
                    return $data;
                } else {
                    Log::warning("Bound service does not have getPluginData method");
                }
            } catch (\Exception $e) {
                Log::error("Failed to use bound service: " . $e->getMessage());
            }
        }

        // Pattern 2: Try to resolve service classes by different naming patterns
        if (isset($pluginInfo['extra']['laravel']['providers'])) {
            Log::info("Pattern 2: Trying service classes from providers...");
            foreach ($pluginInfo['extra']['laravel']['providers'] as $providerClass) {
                Log::info("Checking provider: {$providerClass}");

                // Multiple service class patterns
                $serviceClassPatterns = [
                    // Direct replacement: HelloWorldPluginServiceProvider -> HelloWorldPluginService
                    str_replace('ServiceProvider', 'Service', $providerClass),
                    // Replace Providers with Services: ...Providers\HelloWorldPluginServiceProvider -> ...Services\HelloWorldService
                    str_replace(['Providers\\', 'ServiceProvider'], ['Services\\', 'Service'], $providerClass),
                    // Just change to Services directory: ...Providers\HelloWorldPluginServiceProvider -> ...Services\HelloWorldService
                    str_replace(['Providers\\', 'PluginServiceProvider'], ['Services\\', 'Service'], $providerClass),
                    // Custom pattern for our specific case
                    str_replace(['Providers\\HelloWorldPluginServiceProvider'], ['Services\\HelloWorldService'], $providerClass),
                ];

                foreach ($serviceClassPatterns as $serviceClass) {
                    Log::info("Trying service class pattern: {$serviceClass}");

                    if (class_exists($serviceClass)) {
                        Log::info("Service class exists, instantiating: {$serviceClass}");
                        try {
                            $service = app($serviceClass);
                            Log::info("Service instantiated:", [
                                'class' => get_class($service),
                                'methods' => get_class_methods($service)
                            ]);

                            if (method_exists($service, 'getPluginData')) {
                                Log::info("Calling getPluginData on instantiated service...");
                                $data = $service->getPluginData();
                                Log::info("getPluginData returned:", $data);
                                return $data;
                            } else {
                                Log::warning("Service does not have getPluginData method: {$serviceClass}");
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to instantiate service {$serviceClass}: " . $e->getMessage());
                        }
                    } else {
                        Log::debug("Service class does not exist: {$serviceClass}");
                    }
                }
            }
        }

        // Pattern 3: Try direct class discovery in Services directory
        Log::info("Pattern 3: Trying direct service discovery...");
        $pluginPath = Storage::disk('local')->path($plugin->file_path);
        $servicesPath = $pluginPath . '/src/Services';

        if (File::isDirectory($servicesPath)) {
            $serviceFiles = File::files($servicesPath);
            Log::info("Found service files: " . count($serviceFiles));

            foreach ($serviceFiles as $file) {
                if ($file->getExtension() === 'php') {
                    $serviceName = $file->getBasename('.php');
                    $namespace = $this->getPluginNamespace($pluginInfo);
                    $serviceClass = "{$namespace}\\Services\\{$serviceName}";

                    Log::info("Trying discovered service class: {$serviceClass}");

                    if (class_exists($serviceClass)) {
                        try {
                            $service = app($serviceClass);
                            Log::info("Discovered service instantiated:", [
                                'class' => get_class($service),
                                'methods' => get_class_methods($service)
                            ]);

                            if (method_exists($service, 'getPluginData')) {
                                $data = $service->getPluginData();
                                Log::info("getPluginData from discovered service:", $data);
                                return $data;
                            }
                        } catch (\Exception $e) {
                            Log::error("Failed to use discovered service {$serviceClass}: " . $e->getMessage());
                        }
                    }
                }
            }
        }

        return [];
    }

    /**
     * Get plugin namespace from plugin info
     */
    protected function getPluginNamespace(array $pluginInfo): string
    {
        if (isset($pluginInfo['autoload']['psr-4'])) {
            $namespaces = array_keys($pluginInfo['autoload']['psr-4']);
            if (!empty($namespaces)) {
                return rtrim($namespaces[0], '\\');
            }
        }

        // Fallback
        return 'Plugins\\HelloWorldPlugin';
    }

    /**
     * FIXED VERSION - Try plugin API call
     */
    protected function tryPluginApiCallFixed(Plugin $plugin): array
    {
        $apiEndpoint = "/api/plugins/{$plugin->slug}/data";
        Log::info("Trying API endpoint: {$apiEndpoint}");

        // First check if route exists
        $routeExists = $this->routeExistsFixed($apiEndpoint);
        Log::info("Route exists: " . ($routeExists ? 'YES' : 'NO'));

        if (!$routeExists) {
            Log::info("Route does not exist, skipping API call");
            return [];
        }

        try {
            $fullUrl = url($apiEndpoint);
            Log::info("Making HTTP request to: {$fullUrl}");

            $response = Http::timeout(5)->retry(1)->get($fullUrl);

            Log::info("HTTP response received:", [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body_length' => strlen($response->body())
            ]);

            if ($response->successful()) {
                $responseData = $response->json();
                Log::info("Response JSON decoded:", $responseData);

                if (isset($responseData['data'])) {
                    return $responseData['data'];
                }
                return $responseData;
            } else {
                Log::warning("HTTP request failed:", [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error("HTTP request exception:", [
                'error' => $e->getMessage()
            ]);
        }

        return [];
    }

    /**
     * FIXED VERSION - Check if route exists with better matching
     */
    protected function routeExistsFixed(string $uri): bool
    {
        $routes = Route::getRoutes();
        $cleanUri = trim($uri, '/');

        Log::info("Checking if route exists: {$cleanUri}");

        $found = false;
        foreach ($routes as $route) {
            $routeUri = $route->uri();
            if ($routeUri === $cleanUri) {
                $found = true;
                Log::info("Exact route match found:", [
                    'uri' => $routeUri,
                    'methods' => $route->methods(),
                    'action' => $route->getActionName()
                ]);
                break;
            }
        }

        if (!$found) {
            Log::info("Route not found. Checking for plugin-related routes:");
            $pluginRoutes = [];
            foreach ($routes as $route) {
                $routeUri = $route->uri();
                if (str_contains($routeUri, 'plugins/') || str_contains($routeUri, 'hello-world')) {
                    $pluginRoutes[] = $routeUri;
                }
            }
            Log::info("Available plugin routes: " . implode(', ', $pluginRoutes));
        }

        return $found;
    }

    /**
     * FIXED VERSION - Get plugin config data
     */
    protected function getPluginConfigDataFixed(Plugin $plugin, array $pluginInfo): array
    {
        Log::info("Getting enhanced plugin config data for: {$plugin->slug}");

        $data = [
            'name' => $pluginInfo['name'] ?? $plugin->name,
            'version' => $pluginInfo['version'] ?? $plugin->version,
            'description' => $pluginInfo['description'] ?? $plugin->description,
            'method' => 'config_enhanced'
        ];

        $pluginPath = Storage::disk('local')->path($plugin->file_path);
        $configPath = $pluginPath . '/config';

        Log::info("Checking config path: {$configPath}");

        if (File::isDirectory($configPath)) {
            $configFiles = File::files($configPath);
            Log::info("Config files found: " . count($configFiles));

            $configs = [];
            foreach ($configFiles as $file) {
                if ($file->getExtension() === 'php') {
                    $configName = $file->getBasename('.php');
                    Log::info("Loading config file: {$configName}");

                    try {
                        $configData = include $file->getPathname();
                        if (is_array($configData)) {
                            $configs[$configName] = $configData;
                            Log::info("Config loaded successfully: {$configName}");

                            // Extract useful data from config
                            if (isset($configData['greetings'])) {
                                $data['random_greeting'] = $configData['greetings'][array_rand($configData['greetings'])];
                            }
                            if (isset($configData['features'])) {
                                $data['available_features'] = $configData['features'];
                            }
                        }
                    } catch (\Exception $e) {
                        Log::error("Failed to load config file {$configName}: " . $e->getMessage());
                    }
                }
            }

            if (!empty($configs)) {
                $data['configuration'] = $configs;
            }
        }

        Log::info("Enhanced config data result:", $data);
        return $data;
    }

    /**
     * FIXED VERSION - Get fallback data
     */
    protected function getFallbackPluginDataFixed(Plugin $plugin, array $pluginInfo): array
    {
        Log::info("Generating enhanced fallback data for: {$plugin->slug}");

        $pluginPath = Storage::disk('local')->path($plugin->file_path);

        $data = [
            'message' => "{$plugin->name} Interface",
            'status' => $plugin->is_active ? 'active' : 'inactive',
            'version' => $plugin->version,
            'features' => $pluginInfo['features'] ?? [],
            'method' => 'fallback_enhanced'
        ];

        // Enhanced structure analysis
        $structure = [];
        $paths = [
            'routes' => $pluginPath . '/routes',
            'web_routes' => $pluginPath . '/routes/web.php',
            'api_routes' => $pluginPath . '/routes/api.php',
            'migrations' => $pluginPath . '/database/migrations',
            'views' => $pluginPath . '/resources/views',
            'assets' => $pluginPath . '/resources/assets',
            'models' => $pluginPath . '/src/Models',
            'services' => $pluginPath . '/src/Services',
            'providers' => $pluginPath . '/src/Providers',
            'controllers' => $pluginPath . '/src/Controllers',
        ];

        foreach ($paths as $key => $path) {
            $exists = File::exists($path) || File::isDirectory($path);
            $structure[$key] = $exists ? 'Available' : 'Not Available';
        }

        $data['structure'] = $structure;
        $data['note'] = 'Plugin interface data loaded from enhanced fallback analysis';
        $data['debug_info'] = [
            'plugin_path' => $pluginPath,
            'timestamp' => now()->toDateTimeString()
        ];

        Log::info("Enhanced fallback data generated:", $data);
        return $data;
    }

    /**
     * FIXED VERSION - Get plugin dashboard data
     */
    protected function getPluginDashboardDataFixed(Plugin $plugin): array
    {
        Log::info("=== GET PLUGIN DASHBOARD DATA FIXED ===");

        // Use the same enhanced service resolution for dashboard
        try {
            $pluginInfo = $this->pluginService->getPluginInfo($plugin);

            // Try service methods first
            if (app()->bound($plugin->slug)) {
                $service = app($plugin->slug);
                if (method_exists($service, 'getDashboardData')) {
                    $data = $service->getDashboardData();
                    Log::info("Dashboard data from service getDashboardData:", $data);
                    return $data;
                } elseif (method_exists($service, 'getStats')) {
                    $stats = $service->getStats();
                    return [
                        'message' => "{$plugin->name} Dashboard",
                        'stats' => $stats,
                        'data_source' => 'service_stats'
                    ];
                }
            }

            // Fallback dashboard data
            return [
                'message' => "{$plugin->name} Dashboard",
                'status' => $plugin->is_active ? 'active' : 'inactive',
                'version' => $plugin->version,
                'data_source' => 'fallback_dashboard',
                'note' => 'Dashboard loaded with fallback data'
            ];

        } catch (\Exception $e) {
            Log::error("Error in dashboard data: " . $e->getMessage());
            return [
                'message' => "{$plugin->name} Dashboard",
                'error' => 'Failed to load dashboard data',
                'data_source' => 'error_fallback'
            ];
        }
    }

    // Keep original methods for other functionality
    public function toggle(Plugin $plugin): RedirectResponse
    {
        try {
            if ($plugin->is_active) {
                $this->pluginService->deactivatePlugin($plugin);
                $message = 'Plugin deactivated successfully';
            } else {
                $this->pluginService->activatePlugin($plugin);
                $message = 'Plugin activated successfully';
            }

            return back()->with('success', $message);

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to toggle plugin: ' . $e->getMessage());
        }
    }

    public function destroy(Plugin $plugin): RedirectResponse
    {
        try {
            $this->pluginService->deletePlugin($plugin);

            return back()->with('success', 'Plugin deleted successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete plugin: ' . $e->getMessage());
        }
    }
}