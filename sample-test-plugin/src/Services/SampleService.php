<?php

namespace Plugins\SampleTestPlugin\Services;

use Plugins\SampleTestPlugin\Models\SampleModel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Collection;

class SampleService
{
    /**
     * Get plugin data.
     */
    public function getPluginData(): array
    {
        return [
            'name' => 'Sample Test Plugin',
            'version' => '1.0.0',
            'status' => 'active',
            'message' => __('sample-test-plugin::messages.welcome'),
            'features' => [
                'Service Provider Registration',
                'Dependency Injection',
                'Route Registration (Web & API)',
                'Database Models & Migrations',
                'Blade View Templates',
                'Asset Management (CSS/JS)',
                'Configuration Management',
                'Middleware Support',
                'Internationalization',
                'Caching Integration'
            ],
            'loaded_at' => now()->toDateTimeString()
        ];
    }

    /**
     * Get plugin statistics.
     */
    public function getStats(): array
    {
        return Cache::remember('sample-plugin-stats', 300, function () {
            return [
                'total_samples' => SampleModel::count(),
                'active_samples' => SampleModel::where('is_active', true)->count(),
                'recent_samples' => SampleModel::where('created_at', '>=', now()->subDays(7))->count(),
                'average_data_size' => SampleModel::whereNotNull('data')->get()->avg(function ($model) {
                    return strlen(json_encode($model->data));
                }) ?? 0
            ];
        });
    }

    /**
     * Get plugin metrics.
     */
    public function getMetrics(): array
    {
        $samples = SampleModel::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'daily_samples' => $samples->toArray(),
            'growth_rate' => $this->calculateGrowthRate($samples),
            'peak_day' => $samples->sortByDesc('count')->first(),
            'total_data_size' => SampleModel::all()->sum(function ($model) {
                return strlen(json_encode($model->data ?? []));
            })
        ];
    }

    /**
     * Calculate growth rate.
     */
    protected function calculateGrowthRate(Collection $samples): float
    {
        if ($samples->count() < 2) {
            return 0.0;
        }

        $first = $samples->first();
        $last = $samples->last();

        if ($first->count == 0) {
            return 100.0;
        }

        return round((($last->count - $first->count) / $first->count) * 100, 2);
    }

    /**
     * Create sample data.
     */
    public function createSample(array $data): SampleModel
    {
        return SampleModel::create($data);
    }

    /**
     * Test plugin functionality.
     */
    public function test(): bool
    {
        try {
            // Test database connection
            SampleModel::count();

            // Test configuration
            config('plugins.sample-test-plugin.name');

            // Test caching
            Cache::put('sample-plugin-test', 'working', 60);
            $cached = Cache::get('sample-plugin-test');

            return $cached === 'working';
        } catch (\Exception $e) {
            return false;
        }
    }
}