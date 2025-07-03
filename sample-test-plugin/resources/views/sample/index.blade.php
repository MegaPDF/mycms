@extends('sample-test-plugin::layouts.app')

@section('title', 'Sample Test Plugin - Home')

@section('content')
    <div class="welcome-section">
        <h2>{{ __('sample-test-plugin::messages.welcome') }}</h2>
        <p class="lead">{{ $data['message'] }}</p>

        <div class="plugin-info">
            <div class="info-grid">
                <div class="info-item">
                    <strong>{{ __('sample-test-plugin::messages.version') }}:</strong>
                    {{ $data['version'] }}
                </div>
                <div class="info-item">
                    <strong>{{ __('sample-test-plugin::messages.status') }}:</strong>
                    <span class="status-badge active">{{ $data['status'] }}</span>
                </div>
                <div class="info-item">
                    <strong>{{ __('sample-test-plugin::messages.loaded_at') }}:</strong>
                    {{ $data['loaded_at'] }}
                </div>
            </div>
        </div>

        <div class="features-section">
            <h3>{{ __('sample-test-plugin::messages.features') }}</h3>
            <div class="features-grid">
                @foreach($data['features'] as $feature)
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        {{ $feature }}
                    </div>
                @endforeach
            </div>
        </div>

        <div class="stats-section">
            <h3>{{ __('sample-test-plugin::messages.statistics') }}</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">{{ $stats['total_samples'] }}</div>
                    <div class="stat-label">Total Samples</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $stats['active_samples'] }}</div>
                    <div class="stat-label">Active Samples</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">{{ $stats['recent_samples'] }}</div>
                    <div class="stat-label">Recent Samples</div>
                </div>
            </div>
        </div>

        <div class="actions-section">
            <h3>Test Functions</h3>
            <div class="button-group">
                <button onclick="testPlugin()" class="btn btn-primary">Test Plugin</button>
                <button onclick="loadStats()" class="btn btn-secondary">Refresh Stats</button>
                <button onclick="checkStatus()" class="btn btn-info">Check Status</button>
            </div>
            <div id="test-results" class="test-results"></div>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        function testPlugin() {
            showLoading('Running plugin tests...');

            fetch('/api/plugins/sample-test-plugin/test')
                .then(response => response.json())
                .then(data => {
                    showResults('Plugin Test Results', data);
                })
                .catch(error => {
                    showError('Test failed: ' + error.message);
                });
        }

        function loadStats() {
            showLoading('Loading statistics...');

            fetch('/api/plugins/sample-test-plugin/data')
                .then(response => response.json())
                .then(data => {
                    showResults('Plugin Data', data);
                })
                .catch(error => {
                    showError('Failed to load stats: ' + error.message);
                });
        }

        function checkStatus() {
            showLoading('Checking plugin status...');

            fetch('/api/plugins/sample-test-plugin/status')
                .then(response => response.json())
                .then(data => {
                    showResults('Plugin Status', data);
                })
                .catch(error => {
                    showError('Status check failed: ' + error.message);
                });
        }

        function showLoading(message) {
            document.getElementById('test-results').innerHTML =
                '<div class="loading">' + message + '</div>';
        }

        function showResults(title, data) {
            document.getElementById('test-results').innerHTML =
                '<div class="results success">' +
                '<h4>' + title + '</h4>' +
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>' +
                '</div>';
        }

        function showError(message) {
            document.getElementById('test-results').innerHTML =
                '<div class="results error">' +
                '<h4>Error</h4>' +
                '<p>' + message + '</p>' +
                '</div>';
        }
    </script>
@endpush