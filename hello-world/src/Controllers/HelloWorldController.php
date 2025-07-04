<?php

namespace Plugins\HelloWorldPlugin\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Plugins\HelloWorldPlugin\Services\HelloWorldService;

class HelloWorldController extends Controller
{
    protected HelloWorldService $helloWorldService;

    public function __construct(HelloWorldService $helloWorldService)
    {
        $this->helloWorldService = $helloWorldService;
    }

    /**
     * Display the plugin main page.
     */
    public function index(): View
    {
        $data = $this->helloWorldService->getPluginData();
        $stats = $this->helloWorldService->getStats();

        return view('hello-world-plugin::hello.index', compact('data', 'stats'));
    }

    /**
     * Display the plugin dashboard.
     */
    public function dashboard(): View
    {
        $dashboardData = $this->helloWorldService->getDashboardData();

        return view('hello-world-plugin::hello.dashboard', compact('dashboardData'));
    }

    /**
     * API endpoint for plugin data.
     */
    public function apiData(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->helloWorldService->getPluginData(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * API endpoint for dashboard data.
     */
    public function apiDashboard(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->helloWorldService->getDashboardData(),
            'timestamp' => now()->toISOString()
        ]);
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
                'service_resolution' => true,
                'dynamic_data' => true
            ],
            'stats' => $this->helloWorldService->getStats()
        ]);
    }

    /**
     * API endpoint for creating messages.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:255'
        ]);

        $message = $this->helloWorldService->createMessage($request->message);

        return response()->json([
            'success' => true,
            'data' => $message,
            'message' => 'Hello World message created successfully'
        ], 201);
    }

    /**
     * Test endpoint for functionality verification.
     */
    public function test(): JsonResponse
    {
        return response()->json([
            'plugin' => 'hello-world-plugin',
            'message' => 'Test endpoint working!',
            'timestamp' => now()->toISOString(),
            'random_number' => rand(1, 100),
            'service_data' => $this->helloWorldService->getPluginData()
        ]);
    }
}