<?php

namespace Plugins\HelloWorldPlugin\Services;

class HelloWorldService
{
    /**
     * Get plugin data for interface.
     */
    public function getPluginData(): array
    {
        return [
            'name' => 'Hello World Plugin',
            'version' => '1.0.0',
            'status' => 'active',
            'message' => 'Hello, World! 🌍',
            'greeting' => $this->getRandomGreeting(),
            'features' => [
                'Dynamic Service Resolution',
                'API Endpoints',
                'Configuration Management',
                'Asset Loading',
                'Route Registration'
            ],
            'stats' => $this->getStats(),
            'loaded_at' => now()->toDateTimeString()
        ];
    }

    /**
     * Get plugin statistics for dashboard.
     */
    public function getStats(): array
    {
        return [
            'total_greetings' => rand(50, 200),
            'active_users' => rand(5, 25),
            'messages_sent' => rand(100, 500),
            'uptime_days' => rand(1, 30)
        ];
    }

    /**
     * Get dashboard data.
     */
    public function getDashboardData(): array
    {
        return [
            'message' => 'Hello World Plugin Dashboard',
            'status' => 'operational',
            'metrics' => $this->getMetrics(),
            'recent_activity' => $this->getRecentActivity(),
            'quick_stats' => $this->getStats()
        ];
    }

    /**
     * Get plugin metrics.
     */
    public function getMetrics(): array
    {
        return [
            'response_time' => rand(50, 200) . 'ms',
            'memory_usage' => rand(10, 50) . 'MB',
            'cpu_usage' => rand(5, 25) . '%',
            'success_rate' => rand(95, 100) . '%'
        ];
    }

    /**
     * Get recent activity.
     */
    public function getRecentActivity(): array
    {
        $activities = [
            'User viewed Hello World page',
            'API endpoint called successfully',
            'Configuration updated',
            'Plugin service resolved',
            'Dashboard data refreshed'
        ];

        return collect($activities)
            ->shuffle()
            ->take(3)
            ->map(function ($activity, $index) {
                return [
                    'action' => $activity,
                    'timestamp' => now()->subMinutes(rand(1, 60))->format('H:i:s'),
                    'status' => 'success'
                ];
            })
            ->values()
            ->toArray();
    }

    /**
     * Get random greeting.
     */
    protected function getRandomGreeting(): string
    {
        $greetings = [
            'Hello, World! 🌍',
            'Greetings from the plugin system! 👋',
            'Welcome to Hello World Plugin! 🎉',
            'Plugin system working perfectly! ✅',
            'Dynamic loading successful! 🚀'
        ];

        return $greetings[array_rand($greetings)];
    }

    /**
     * Create a test message.
     */
    public function createMessage(string $message): array
    {
        return [
            'id' => rand(1000, 9999),
            'message' => $message,
            'created_at' => now()->toDateTimeString(),
            'status' => 'active'
        ];
    }
}