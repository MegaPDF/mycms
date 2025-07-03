<?php
namespace App\Services;

use App\Models\Plugin;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Artisan;
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
            $suspiciousFiles = $this->fileUploadService->scanForMaliciousFilesInPlugin($extractPath);
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
        $activated = $plugin->activate();

        if ($activated) {
            try {
                // Run plugin migrations after activation
                $this->runPluginMigrations($plugin);

                // Publish plugin assets
                $this->publishPluginAssets($plugin);

                // Clear cache to reload routes/providers
                $this->clearApplicationCache();

            } catch (\Exception $e) {
                // If anything fails, deactivate the plugin
                $plugin->deactivate();
                throw new \Exception("Plugin activation failed: " . $e->getMessage());
            }
        }

        return $activated;
    }

    public function deactivatePlugin(Plugin $plugin): bool
    {
        $deactivated = $plugin->deactivate();

        if ($deactivated) {
            // Clear cache when deactivating
            $this->clearApplicationCache();
        }

        return $deactivated;
    }

    /**
     * Run migrations for a specific plugin using a simpler approach
     */
    protected function runPluginMigrations(Plugin $plugin): void
    {
        $pluginPath = Storage::disk('local')->path($plugin->file_path);
        $migrationsPath = $pluginPath . '/database/migrations';

        if (File::isDirectory($migrationsPath)) {
            try {
                // Simply run migrate with the plugin path
                $relativePath = str_replace(base_path() . '/', '', $migrationsPath);

                Artisan::call('migrate', [
                    '--path' => $relativePath,
                    '--force' => true
                ]);

            } catch (\Exception $e) {
                \Log::error("Plugin migration failed: " . $e->getMessage());
                // Don't throw error, just log it for now
            }
        }
    }

    /**
     * Run a single migration file by including it directly
     */
    protected function runSingleMigration(string $migrationPath, Plugin $plugin): void
    {
        // Read the original migration file
        $migrationContent = File::get($migrationPath);

        // Generate a unique temporary filename
        $timestamp = date('Y_m_d_His') . rand(100, 999);
        $tempFileName = "{$timestamp}_plugin_{$plugin->slug}_migration.php";
        $tempMigrationPath = database_path('migrations/' . $tempFileName);

        try {
            // Create a safe class name
            $originalClassName = $this->extractClassName($migrationContent);
            $safeClassName = 'Plugin' . Str::studly($plugin->slug) . 'Migration' . $timestamp;

            // Replace the class name in the migration content
            $newContent = preg_replace(
                '/class\s+' . preg_quote($originalClassName, '/') . '(\s+extends\s+Migration)?/',
                "class {$safeClassName} extends Migration",
                $migrationContent
            );

            // Ensure we have the Migration import
            if (!str_contains($newContent, 'use Illuminate\Database\Migrations\Migration;')) {
                $newContent = str_replace(
                    '<?php',
                    "<?php\n\nuse Illuminate\Database\Migrations\Migration;\nuse Illuminate\Database\Schema\Blueprint;\nuse Illuminate\Support\Facades\Schema;",
                    $newContent
                );
            }

            // Write the temporary migration file
            File::put($tempMigrationPath, $newContent);

            // Run the migration
            Artisan::call('migrate', [
                '--path' => 'database/migrations/' . $tempFileName,
                '--force' => true
            ]);

            // Check if migration was successful
            $output = Artisan::output();
            if (str_contains($output, 'SQLSTATE') || str_contains($output, 'ERROR')) {
                throw new \Exception("Migration execution failed: " . $output);
            }

        } finally {
            // Always clean up the temporary file
            if (File::exists($tempMigrationPath)) {
                File::delete($tempMigrationPath);
            }
        }
    }

    /**
     * Extract class name from migration file content
     */
    protected function extractClassName(string $content): string
    {
        if (preg_match('/class\s+(\w+)/', $content, $matches)) {
            return $matches[1];
        }

        return 'UnknownMigration';
    }

    /**
     * Alternative method: Use Laravel's migration repository directly
     */
    protected function runPluginMigrationsAlternative(Plugin $plugin): void
    {
        $pluginPath = Storage::disk('local')->path($plugin->file_path);
        $migrationsPath = $pluginPath . '/database/migrations';

        if (!File::isDirectory($migrationsPath)) {
            return;
        }

        try {
            // Use Laravel's migrator directly
            $migrator = app('migrator');
            $repository = $migrator->getRepository();

            // Get migration files
            $files = $migrator->getMigrationFiles($migrationsPath);

            // Prepare migrations
            $migrations = [];
            foreach ($files as $file) {
                $migration = $migrator->resolve($migrator->getMigrationName($file));
                $migrations[] = $migration;
            }

            // Run migrations using the public run method
            $migrator->run($migrationsPath, ['pretend' => false, 'step' => true]);

        } catch (\Exception $e) {
            \Log::error("Alternative migration method failed for plugin {$plugin->slug}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Publish plugin assets
     */
    protected function publishPluginAssets(Plugin $plugin): void
    {
        $pluginPath = Storage::disk('local')->path($plugin->file_path);
        $assetsPath = $pluginPath . '/resources/assets';
        $publicPath = public_path("plugins/{$plugin->slug}");

        if (File::isDirectory($assetsPath)) {
            File::ensureDirectoryExists(dirname($publicPath));

            // Remove existing assets first
            if (File::exists($publicPath)) {
                File::deleteDirectory($publicPath);
            }

            // Copy new assets
            File::copyDirectory($assetsPath, $publicPath);
        }
    }

    /**
     * Clear application cache
     */
    protected function clearApplicationCache(): void
    {
        try {
            // Clear various caches
            Artisan::call('cache:clear');
            Artisan::call('route:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');

            // Also clear opcache if available
            if (function_exists('opcache_reset')) {
                opcache_reset();
            }

        } catch (\Exception $e) {
            \Log::warning("Failed to clear some caches: " . $e->getMessage());
            // Don't throw error for cache clearing failures
        }
    }

    // ... rest of your existing methods stay the same ...

    public function deletePlugin(Plugin $plugin): bool
    {
        // Delete files
        $this->fileUploadService->deleteDirectory($plugin->file_path);

        // Delete published assets
        $publicPath = public_path("plugins/{$plugin->slug}");
        if (File::exists($publicPath)) {
            File::deleteDirectory($publicPath);
        }

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
