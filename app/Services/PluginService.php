<?php
namespace App\Services;

use App\Models\Plugin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PluginService
{
    protected FileUploadService $fileUploadService;

    public function __construct(FileUploadService $fileUploadService)
    {
        $this->fileUploadService = $fileUploadService;
    }

    public function uploadPlugin(UploadedFile $file): Plugin
    {
        // Validate file
        $errors = $this->fileUploadService->validateFile($file);
        if (!empty($errors)) {
            throw new \Exception(implode(' ', $errors));
        }

        // Upload file
        $zipPath = $this->fileUploadService->uploadFile($file, 'plugins');

        // Generate unique slug for extraction
        $slug = Str::uuid();
        $extractPath = "plugins/extracted/{$slug}";

        try {
            // Extract ZIP
            if (!$this->fileUploadService->extractZip($zipPath, $extractPath)) {
                throw new \Exception('Failed to extract plugin archive.');
            }

            // Scan for malicious files
            $suspiciousFiles = $this->fileUploadService->scanForMaliciousFiles($extractPath);
            if (!empty($suspiciousFiles)) {
                $this->fileUploadService->deleteDirectory($extractPath);
                throw new \Exception('Malicious files detected: ' . implode(', ', $suspiciousFiles));
            }

            // Read plugin configuration
            $config = $this->readPluginConfig($extractPath);

            // Move to permanent location
            $finalPath = "plugins/{$config['slug']}";
            $this->movePlugin($extractPath, $finalPath);

            // Create database record
            $plugin = Plugin::create([
                'name' => $config['name'],
                'slug' => $config['slug'],
                'version' => $config['version'],
                'description' => $config['description'] ?? null,
                'author' => $config['author'] ?? null,
                'file_path' => $finalPath,
                'config' => $config,
                'is_installed' => true,
                'installed_at' => now(),
            ]);

            // Clean up temporary files
            $this->fileUploadService->deleteFile($zipPath);

            return $plugin;

        } catch (\Exception $e) {
            // Clean up on error
            $this->fileUploadService->deleteFile($zipPath);
            $this->fileUploadService->deleteDirectory($extractPath);
            throw $e;
        }
    }

    protected function readPluginConfig(string $extractPath): array
    {
        $configPath = Storage::disk('local')->path($extractPath . '/plugin.json');

        if (!File::exists($configPath)) {
            throw new \Exception('Plugin configuration file (plugin.json) not found.');
        }

        $config = json_decode(File::get($configPath), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid plugin configuration file.');
        }

        // Validate required fields
        $required = ['name', 'slug', 'version'];
        foreach ($required as $field) {
            if (empty($config[$field])) {
                throw new \Exception("Missing required field: {$field}");
            }
        }

        // Check if plugin already exists
        if (Plugin::where('slug', $config['slug'])->exists()) {
            throw new \Exception("Plugin with slug '{$config['slug']}' already exists.");
        }

        return $config;
    }

    protected function movePlugin(string $from, string $to): void
    {
        $fromPath = Storage::disk('local')->path($from);
        $toPath = Storage::disk('local')->path($to);

        File::ensureDirectoryExists(dirname($toPath));
        File::moveDirectory($fromPath, $toPath);
    }

    public function activatePlugin(Plugin $plugin): bool
    {
        return $plugin->activate();
    }

    public function deactivatePlugin(Plugin $plugin): bool
    {
        return $plugin->deactivate();
    }

    public function deletePlugin(Plugin $plugin): bool
    {
        // Delete files
        $this->fileUploadService->deleteDirectory($plugin->file_path);

        // Delete database record
        return $plugin->delete();
    }

    public function getPluginInfo(Plugin $plugin): array
    {
        $configPath = Storage::disk('local')->path($plugin->file_path . '/plugin.json');

        if (File::exists($configPath)) {
            return json_decode(File::get($configPath), true) ?: [];
        }

        return [];
    }
}
