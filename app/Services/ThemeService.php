<?php
namespace App\Services;

use App\Models\Theme;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ThemeService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function uploadTheme(UploadedFile $file): Theme
    {
        // Validate file
        $errors = $this->fileUploadService->validateFile($file);
        if (!empty($errors)) {
            throw new \Exception(implode(' ', $errors));
        }

        // Upload file
        $zipPath = $this->fileUploadService->uploadFile($file, 'themes');

        // Generate unique slug for extraction
        $slug = Str::uuid();
        $extractPath = "themes/extracted/{$slug}";

        try {
            // Extract ZIP
            if (!$this->fileUploadService->extractZip($zipPath, $extractPath)) {
                throw new \Exception('Failed to extract theme archive.');
            }

            // Read theme configuration
            $config = $this->readThemeConfig($extractPath);

            // Move to permanent location
            $finalPath = "themes/{$config['slug']}";
            $this->moveTheme($extractPath, $finalPath);

            // Copy preview image to public directory
            $previewImage = $this->copyPreviewImage($finalPath, $config['slug']);

            // Create database record
            $theme = Theme::create([
                'name' => $config['name'],
                'slug' => $config['slug'],
                'version' => $config['version'],
                'description' => $config['description'] ?? null,
                'author' => $config['author'] ?? null,
                'file_path' => $finalPath,
                'preview_image' => $previewImage,
                'config' => $config,
            ]);

            // Clean up temporary files
            $this->fileUploadService->deleteFile($zipPath);

            return $theme;

        } catch (\Exception $e) {
            // Clean up on error
            $this->fileUploadService->deleteFile($zipPath);
            $this->fileUploadService->deleteDirectory($extractPath);
            throw $e;
        }
    }

    protected function readThemeConfig(string $extractPath): array
    {
        $configPath = Storage::disk('local')->path($extractPath . '/theme.json');

        if (!File::exists($configPath)) {
            throw new \Exception('Theme configuration file (theme.json) not found.');
        }

        $config = json_decode(File::get($configPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid theme configuration file.');
        }

        // Validate required fields
        $required = ['name', 'slug', 'version'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                throw new \Exception("Missing required field: {$field}");
            }
        }

        // Check if theme already exists
        if (Theme::where('slug', $config['slug'])->exists()) {
            throw new \Exception("Theme with slug '{$config['slug']}' already exists.");
        }

        return $config;
    }

    protected function moveTheme(string $from, string $to): void
    {
        $fromPath = Storage::disk('local')->path($from);
        $toPath = Storage::disk('local')->path($to);

        File::ensureDirectoryExists(dirname($toPath));
        File::moveDirectory($fromPath, $toPath);
    }

    protected function copyPreviewImage(string $themePath, string $slug): ?string
    {
        $possibleImages = ['preview.jpg', 'preview.png', 'screenshot.jpg', 'screenshot.png'];
        $sourceDir = Storage::disk('local')->path($themePath);

        foreach ($possibleImages as $image) {
            $sourcePath = $sourceDir . '/' . $image;
            if (File::exists($sourcePath)) {
                $publicPath = "themes/{$slug}/" . $image;
                $destinationPath = public_path($publicPath);

                File::ensureDirectoryExists(dirname($destinationPath));
                File::copy($sourcePath, $destinationPath);

                return $publicPath;
            }
        }

        return null;
    }

    public function activateTheme(Theme $theme): bool
    {
        return $theme->activate();
    }

    public function deactivateTheme(Theme $theme): bool
    {
        return $theme->deactivate();
    }

    public function deleteTheme(Theme $theme): bool
    {
        // Delete files
        $this->fileUploadService->deleteDirectory($theme->file_path);

        // Delete preview image
        if ($theme->preview_image) {
            $publicPath = public_path($theme->preview_image);
            if (File::exists($publicPath)) {
                File::delete($publicPath);
            }
        }

        // Delete database record
        return $theme->delete();
    }

    public function getThemeInfo(Theme $theme): array
    {
        $configPath = Storage::disk('local')->path($theme->file_path . '/theme.json');

        if (File::exists($configPath)) {
            return json_decode(File::get($configPath), true) ?: [];
        }

        return [];
    }

    public static function getActiveTheme(): ?Theme
    {
        return Theme::getActive();
    }
}