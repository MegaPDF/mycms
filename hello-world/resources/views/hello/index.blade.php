<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $data['name'] }}</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.19/tailwind.min.css" rel="stylesheet">
    <link href="/plugins/hello-world-plugin/css/hello.css" rel="stylesheet">
</head>

<body class="bg-gray-100 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">{{ $data['name'] }}</h1>
            <p class="text-gray-600">{{ $data['message'] }}</p>
            <div class="mt-4">
                <span class="inline-block bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                    {{ $data['status'] }}
                </span>
                <span class="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded ml-2">
                    v{{ $data['version'] }}
                </span>
            </div>
        </div>

        <!-- Random Greeting -->
        <div class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-6 mb-6 text-white">
            <h2 class="text-xl font-semibold mb-2">Dynamic Greeting</h2>
            <p class="text-lg">{{ $data['greeting'] }}</p>
            <p class="text-sm opacity-75 mt-2">Loaded at: {{ $data['loaded_at'] }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Features -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Features</h2>
                <ul class="space-y-2">
                    @foreach($data['features'] as $feature)
                        <li class="flex items-center">
                            <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd"></path>
                            </svg>
                            {{ $feature }}
                        </li>
                    @endforeach
                </ul>
            </div>

            <!-- Statistics -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Statistics</h2>
                <div class="space-y-3">
                    @foreach($stats as $key => $value)
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 capitalize">{{ str_replace('_', ' ', $key) }}</span>
                            <span class="font-semibold text-gray-800">{{ $value }}</span>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- API Testing -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">API Testing</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onclick="testApi('/api/plugins/hello-world-plugin/data')"
                    class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded">
                    Test Data API
                </button>
                <button onclick="testApi('/api/plugins/hello-world-plugin/status')"
                    class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">
                    Test Status API
                </button>
                <button onclick="testApi('/api/plugins/hello-world-plugin/test')"
                    class="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded">
                    Test Random API
                </button>
            </div>
            <div id="api-result" class="mt-4 p-4 bg-gray-50 rounded hidden">
                <pre class="text-sm overflow-auto"></pre>
            </div>
        </div>

        <!-- Navigation -->
        <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Navigation</h2>
            <div class="space-x-4">
                <a href="/plugins/hello-world-plugin/dashboard"
                    class="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded inline-block">
                    View Dashboard
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
        function testApi(endpoint) {
            const resultDiv = document.getElementById('api-result');
            const preElement = resultDiv.querySelector('pre');

            resultDiv.classList.remove('hidden');
            preElement.textContent = 'Loading...';

            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    preElement.textContent = JSON.stringify(data, null, 2);
                })
                .catch(error => {
                    preElement.textContent = 'Error: ' + error.message;
                });
        }
    </script>
</body>

</html>