<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plugin;
use App\Models\Theme;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth', 'admin']);
    }

    public function index(): Response
    {
        $stats = [
            'users' => User::count(),
            'plugins' => Plugin::count(),
            'active_plugins' => Plugin::where('is_active', true)->count(),
            'themes' => Theme::count(),
            'active_theme' => Theme::where('is_active', true)->first()?->name ?? 'Default',
        ];

        $recentPlugins = Plugin::latest()->take(5)->get();
        $recentThemes = Theme::latest()->take(5)->get();

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
            'recentPlugins' => $recentPlugins,
            'recentThemes' => $recentThemes,
        ]);
    }
}
