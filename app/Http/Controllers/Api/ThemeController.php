<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ThemeUploadRequest;
use App\Models\Theme;
use App\Services\ThemeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    protected ThemeService $themeService;

    public function __construct(ThemeService $themeService)
    {
        $this->themeService = $themeService;
        $this->middleware(['auth', 'role:admin,super_admin']);
    }

    public function index(): JsonResponse
    {
        $themes = Theme::orderBy('name')->get();

        return response()->json([
            'data' => $themes,
            'message' => 'Themes retrieved successfully'
        ]);
    }

    public function show(Theme $theme): JsonResponse
    {
        $info = $this->themeService->getThemeInfo($theme);

        return response()->json([
            'data' => array_merge($theme->toArray(), ['info' => $info]),
            'message' => 'Theme details retrieved successfully'
        ]);
    }

    public function upload(ThemeUploadRequest $request): JsonResponse
    {
        try {
            $theme = $this->themeService->uploadTheme($request->file('file'));

            return response()->json([
                'data' => $theme,
                'message' => 'Theme uploaded successfully'
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload theme: ' . $e->getMessage()
            ], 422);
        }
    }

    public function activate(Theme $theme): JsonResponse
    {
        try {
            $this->themeService->activateTheme($theme);

            return response()->json([
                'data' => $theme->fresh(),
                'message' => 'Theme activated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to activate theme: ' . $e->getMessage()
            ], 422);
        }
    }

    public function destroy(Theme $theme): JsonResponse
    {
        try {
            if ($theme->is_active) {
                return response()->json([
                    'message' => 'Cannot delete active theme'
                ], 422);
            }

            $this->themeService->deleteTheme($theme);

            return response()->json([
                'message' => 'Theme deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete theme: ' . $e->getMessage()
            ], 422);
        }
    }
}