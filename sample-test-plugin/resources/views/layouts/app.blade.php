<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Sample Test Plugin')</title>
    <link href="{{ asset('plugins/sample-test-plugin/css/sample.css') }}" rel="stylesheet">
    @stack('styles')
</head>

<body>
    <div class="container">
        <header class="plugin-header">
            <h1>Sample Test Plugin</h1>
            <nav>
                <a href="{{ route('sample-test-plugin.index') }}">Home</a>
                <a href="{{ route('sample-test-plugin.dashboard') }}">Dashboard</a>
            </nav>
        </header>

        <main class="plugin-content">
            @yield('content')
        </main>

        <footer class="plugin-footer">
            <p>&copy; {{ date('Y') }} Sample Test Plugin v1.0.0</p>
        </footer>
    </div>

    <script src="{{ asset('plugins/sample-test-plugin/js/sample.js') }}"></script>
    @stack('scripts')
</body>

</html>