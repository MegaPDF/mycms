<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hello World Plugin Dashboard</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="/plugins/hello-world-plugin/css/hello.css" rel="stylesheet">
</head>

<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ $dashboardData['message'] }}</h1>
            <div class="flex items-center">
                <span class="inline-block bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {{ $dashboardData['status'] }}
                </span>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            @foreach($dashboardData['quick_stats'] as $key => $value)
                <div class="bg-white rounded-lg shadow-md p-6">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-lg">
                            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                                </path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600 capitalize">{{ str_replace('_', ' ', $key) }}</p>
                            <p class="text-2xl font-semibold text-gray-900">{{ $value }}</p>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Metrics -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">System Metrics</h2>
                <div class="space-y-4">
                    @foreach($dashboardData['metrics'] as $metric => $value)
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 capitalize">{{ str_replace('_', ' ', $metric) }}</span>
                            <span class="font-semibold text-gray-800">{{ $value }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div class="space-y-3">
                    @forelse($dashboardData['recent_activity'] as $activity)
                        <div class="flex items-center p-3 bg-gray-50 rounded-lg">
                            <div class="p-1 bg-green-100 rounded-full mr-3">
                                <svg class="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clip-rule="evenodd"></path>
                                </svg>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900">{{ $activity['action'] }}</p>
                                <p class="text-xs text-gray-500">{{ $activity['timestamp'] }}</p>
                            </div>
                        </div>
                    @empty
                        <p class="text-gray-500">No recent activity</p>
                    @endforelse
                </div>
            </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onclick="refreshDashboard()"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                    Refresh Dashboard
                </button>
                <button onclick="testPluginApi()"
                    class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
                    Test Plugin API
                </button>
                <button onclick="viewLogs()"
                    class="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded">
                    View Logs
                </button>
            </div>
        </div>

        <!-- API Test Results -->
        <div id="test-results" class="bg-white rounded-lg shadow-md p-6 mt-6 hidden">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
            <div class="bg-gray-50 rounded p-4">
                <pre id="test-output" class="text-sm overflow-auto"></pre>
            </div>
        </div>

        <!-- Navigation -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Navigation</h2>
            <div class="space-x-4">
                <a href="/plugins/hello-world-plugin"
                    class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded inline-block">
                    Plugin Home
                </a>
                <a href="/admin/plugins"
                    class="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded inline-block">
                    Back to Admin
                </a>
            </div>
        </div>
    </div>

    <script src="/plugins/hello-world-plugin/js/hello.js"></script>
    <script>
        function refreshDashboard() {
            location.reload();
        }

        function testPluginApi() {
            const resultDiv = document.getElementById('test-results');
            const outputElement = document.getElementById('test-output');

            resultDiv.classList.remove('hidden');
            outputElement.textContent = 'Testing plugin APIs...';

            Promise.all([
                fetch('/api/plugins/hello-world-plugin/data').then(r => r.json()),
                fetch('/api/plugins/hello-world-plugin/status').then(r => r.json()),
                fetch('/api/plugins/hello-world-plugin/test').then(r => r.json())
            ])
                .then(results => {
                    outputElement.textContent = JSON.stringify({
                        data_api: results[0],
                        status_api: results[1],
                        test_api: results[2]
                    }, null, 2);
                })
                .catch(error => {
                    outputElement.textContent = 'Error: ' + error.message;
                });
        }

        function viewLogs() {
            alert('Logs feature would be implemented here in a real plugin!');
        }
    </script>
</body>

</html>