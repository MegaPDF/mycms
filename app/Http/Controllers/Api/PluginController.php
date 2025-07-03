<?php
// app/Http/Controllers/Api/PluginController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PluginUploadRequest;
use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PluginController extends Controller
{
    protected PluginService $pluginService;

    public function __construct(PluginService $pluginService)
    {
        $this->pluginService = $pluginService;
        $this->middleware(['auth', 'role:admin,super_admin']);
    }

    public function index(): JsonResponse
    {
        $plugins = Plugin::orderBy('name')->get();

        return response()->json([
            'data' => $plugins,
            'message' => 'Plugins retrieved successfully'
        ]);
    }

    public function show(Plugin $plugin): JsonResponse
    {
        $info = $this->pluginService->getPluginInfo($plugin);

        return response()->json([
            'data' => array_merge($plugin->toArray(), ['info' => $info]),
            'message' => 'Plugin details retrieved successfully'
        ]);
    }

    public function upload(PluginUploadRequest $request): JsonResponse
    {
        try {
            $plugin = $this->pluginService->uploadPlugin($request->file('file'));

            return response()->json([
                'data' => $plugin,
                'message' => 'Plugin uploaded successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload plugin: ' . $e->getMessage()
            ], 422);
        }
    }

    public function toggle(Plugin $plugin): JsonResponse
    {
        try {
            if ($plugin->is_active) {
                $this->pluginService->deactivatePlugin($plugin);
                $message = 'Plugin deactivated successfully';
            } else {
                $this->pluginService->activatePlugin($plugin);
                $message = 'Plugin activated successfully';
            }

            return response()->json([
                'data' => $plugin->fresh(),
                'message' => $message
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to toggle plugin: ' . $e->getMessage()
            ], 422);
        }
    }

    public function destroy(Plugin $plugin): JsonResponse
    {
        try {
            $this->pluginService->deletePlugin($plugin);

            return response()->json([
                'message' => 'Plugin deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete plugin: ' . $e->getMessage()
            ], 422);
        }
    }
}