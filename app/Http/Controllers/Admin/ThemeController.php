<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Theme;
use App\Services\ThemeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controller as BaseController;
use Inertia\Inertia;
use Inertia\Response;

class ThemeController extends BaseController
{
    protected ThemeService $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
        $this->middleware(['auth', 'admin']);
    }

    public function index(): Response
    {
        $themes = Theme::orderBy('name')->get();

        return Inertia::render('admin/themes', [
            'themes' => $themes,
        ]);
    }

    public function activate(Theme $theme): RedirectResponse
    {
        try {
            $this->themeService->activateTheme($theme);

            return back()->with('success', 'Theme activated successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to activate theme: ' . $e->getMessage());
        }
    }

    public function destroy(Theme $theme): RedirectResponse
    {
        try {
            if ($theme->is_active) {
                return back()->with('error', 'Cannot delete active theme');
            }

            $this->themeService->deleteTheme($theme);

            return back()->with('success', 'Theme deleted successfully');

        } catch (\Exception $e) {
            return back()->with('error', 'Failed to delete theme: ' . $e->getMessage());
        }
    }
}
