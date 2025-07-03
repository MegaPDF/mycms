<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Services\PluginService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
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