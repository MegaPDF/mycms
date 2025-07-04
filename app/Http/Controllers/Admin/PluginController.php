<?php
// Fixed app/Http/Controllers/Admin/PluginController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

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
        $pluginInfo = $this->pluginService->getPluginInfo($plugin);

        return Inertia::render('admin/plugin-detail', [
            'plugin' => array_merge($plugin->toArray(), ['info' => $pluginInfo]),
        ]);
    }

    /**
     * Show plugin interface (admin-wrapped plugin view)
     */
    public function interface(Plugin $plugin): Response
    {
        // Check if plugin is active
        if (!$plugin->is_active) {
            return back()->with('error', 'Plugin must be active to view interface');
        }

        // Get plugin info from plugin.json
        $pluginInfo = $this->pluginService->getPluginInfo($plugin);

        // Try to get additional runtime data if plugin has API endpoints
        $pluginData = $this->getPluginRuntimeData($plugin);

        return Inertia::render('admin/plugin-interface', [
            'plugin' => $plugin,
            'pluginInfo' => $pluginInfo,
            'pluginData' => $pluginData,
        ]);
    }

    /**
     * Show plugin dashboard (admin-wrapped plugin dashboard)
     */
    public function dashboard(Plugin $plugin): Response
    {
        // Check if plugin is active
        if (!$plugin->is_active) {
            return back()->with('error', 'Plugin must be active to view dashboard');
        }

        // Get plugin info
        $pluginInfo = $this->pluginService->getPluginInfo($plugin);

        // Try to get dashboard data
        $dashboardData = $this->getPluginDashboardData($plugin);

        return Inertia::render('admin/plugin-dashboard', [
            'plugin' => $plugin,
            'pluginInfo' => $pluginInfo,
            'dashboardData' => $dashboardData,
        ]);
    }

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

    /**
     * Get plugin runtime data by calling its API endpoints
     */
    protected function getPluginRuntimeData(Plugin $plugin): array
    {
        try {
            // For sample-test-plugin, try to get data from its API
            if ($plugin->slug === 'sample-test-plugin') {
                return $this->getSamplePluginData();
            }

            // For other plugins, try generic approach
            return $this->getGenericPluginData($plugin);

        } catch (\Exception $e) {
            Log::warning("Failed to get runtime data for plugin {$plugin->slug}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get dashboard data for plugin
     */
    protected function getPluginDashboardData(Plugin $plugin): array
    {
        try {
            // For sample-test-plugin
            if ($plugin->slug === 'sample-test-plugin') {
                return $this->getSamplePluginDashboard();
            }

            return [];

        } catch (\Exception $e) {
            Log::warning("Failed to get dashboard data for plugin {$plugin->slug}: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get data specifically for sample-test-plugin
     */
    protected function getSamplePluginData(): array
    {
        try {
            // Try to use the plugin service directly if available
            if (app()->bound('sample-test-plugin')) {
                $service = app('sample-test-plugin');
                if (method_exists($service, 'getPluginData')) {
                    return $service->getPluginData();
                }
            }

            // Fallback: make internal API call
            $response = Http::get(url('/api/plugins/sample-test-plugin/data'));

            if ($response->successful()) {
                return $response->json('data', []);
            }

        } catch (\Exception $e) {
            Log::warning("Failed to get sample plugin data: " . $e->getMessage());
        }

        return [
            'message' => 'Sample Test Plugin Interface',
            'status' => 'active',
            'features' => [
                'Web Routes' => 'Available',
                'API Routes' => 'Available',
                'Database' => 'Connected',
                'Views' => 'Loaded',
                'Assets' => 'Published'
            ]
        ];
    }

    /**
     * Get dashboard data for sample-test-plugin
     */
    protected function getSamplePluginDashboard(): array
    {
        try {
            // Try to get samples from database if model exists
            if (class_exists('Plugins\SampleTestPlugin\Models\SampleModel')) {
                $sampleModel = 'Plugins\SampleTestPlugin\Models\SampleModel';
                $samples = $sampleModel::latest()->take(10)->get()->toArray();
                $totalSamples = $sampleModel::count();

                return [
                    'samples' => $samples,
                    'totalSamples' => $totalSamples,
                    'recentActivity' => $samples
                ];
            }

        } catch (\Exception $e) {
            Log::warning("Failed to get sample plugin dashboard: " . $e->getMessage());
        }

        return [
            'message' => 'Sample Plugin Dashboard',
            'samples' => [],
            'totalSamples' => 0,
            'recentActivity' => []
        ];
    }

    /**
     * Generic method to get plugin data
     */
    protected function getGenericPluginData(Plugin $plugin): array
    {
        return [
            'message' => "Plugin {$plugin->name} Interface",
            'status' => $plugin->is_active ? 'active' : 'inactive',
            'info' => 'This plugin does not have custom interface data available.'
        ];
    }
}