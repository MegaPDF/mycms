@extends('sample-test-plugin::layouts.app')

@section('title', 'Sample Test Plugin - Dashboard')

@section('content')
    <div class="dashboard">
        <h2>Plugin Dashboard</h2>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Growth Rate</h3>
                <div class="metric-value">{{ $metrics['growth_rate'] }}%</div>
            </div>
            <div class="metric-card">
                <h3>Peak Day</h3>
                <div class="metric-value">
                    @if($metrics['peak_day'])
                        {{ $metrics['peak_day']['count'] }} samples
                        <small>on {{ $metrics['peak_day']['date'] }}</small>
                    @else
                        No data
                    @endif
                </div>
            </div>
            <div class="metric-card">
                <h3>Total Data Size</h3>
                <div class="metric-value">{{ number_format($metrics['total_data_size']) }} bytes</div>
            </div>
        </div>

        <div class="samples-section">
            <h3>Recent Samples</h3>
            @if($samples->count() > 0)
                <div class="samples-list">
                    @foreach($samples as $sample)
                        <div class="sample-item">
                            <div class="sample-header">
                                <h4>{{ $sample->name }}</h4>
                                <span class="sample-status {{ $sample->is_active ? 'active' : 'inactive' }}">
                                    {{ $sample->is_active ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                            @if($sample->description)
                                <p>{{ $sample->description }}</p>
                            @endif
                            <div class="sample-meta">
                                <span>Created: {{ $sample->formatted_created_at }}</span>
                                <span>Size: {{ $sample->data_size }} bytes</span>
                            </div>
                        </div>
                    @endforeach
                </div>
            @else
                <p class="empty-state">No samples found. Create some sample data to see them here.</p>
            @endif
        </div>

        <div class="chart-section">
            <h3>Daily Sample Creation</h3>
            <canvas id="samplesChart" width="400" height="200"></canvas>
        </div>
    </div>
@endsection

@push('scripts')
    <script>
        // Simple chart implementation
        const chartData = @json($metrics['daily_samples']);

        // You could integrate Chart.js or similar here
        console.log('Chart data:', chartData);
    </script>
@endpush