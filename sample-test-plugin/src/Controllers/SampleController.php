<?php

namespace Plugins\SampleTestPlugin\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Plugins\SampleTestPlugin\Services\SampleService;
use Plugins\SampleTestPlugin\Models\SampleModel;

class SampleController extends Controller
{
    protected SampleService $sampleService;

    public function __construct(SampleService $sampleService)
    {
        $this->sampleService = $sampleService;
    }

    /**
     * Display the plugin main page.
     */
    public function index(): View
    {
        $data = $this->sampleService->getPluginData();
        $stats = $this->sampleService->getStats();

        return view('sample-test-plugin::sample.index', compact('data', 'stats'));
    }

    /**
     * Display the plugin dashboard.
     */
    public function dashboard(): View
    {
        $samples = SampleModel::latest()->take(10)->get();
        $metrics = $this->sampleService->getMetrics();

        return view('sample-test-plugin::sample.dashboard', compact('samples', 'metrics'));
    }

    /**
     * API endpoint for plugin data.
     */
    public function apiData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->sampleService->getPluginData(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * API endpoint for creating sample data.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'data' => 'nullable|array'
        ]);

        $sample = SampleModel::create([
            'name' => $request->name,
            'description' => $request->description,
            'data' => $request->data ?? [],
            'is_active' => true
        ]);

        return response()->json([
            'success' => true,
            'data' => $sample,
            'message' => 'Sample data created successfully'
        ], 201);
    }

    /**
     * API endpoint for plugin status.
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'status' => 'active',
            'health' => 'excellent',
            'version' => '1.0.0',
            'features' => [
                'web_routes' => true,
                'api_routes' => true,
                'database' => true,
                'views' => true,
                'assets' => true,
                'translations' => true,
                'middleware' => true
            ],
            'stats' => $this->sampleService->getStats()
        ]);
    }

    /**
     * Test endpoint for functionality verification.
     */
    public function test(): JsonResponse
    {
        $tests = [
            'service_injection' => $this->sampleService !== null,
            'config_loaded' => config('plugins.sample-test-plugin.name') !== null,
            'database_connection' => SampleModel::count() >= 0,
            'translation_loaded' => __('sample-test-plugin::messages.welcome') !== 'sample-test-plugin::messages.welcome'
        ];

        return response()->json([
            'message' => 'Plugin test completed',
            'plugin' => 'sample-test-plugin',
            'version' => '1.0.0',
            'tests' => $tests,
            'all_passed' => !in_array(false, $tests),
            'timestamp' => now()->toISOString()
        ]);
    }
}