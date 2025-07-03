<?php

namespace Plugins\SampleTestPlugin\Database\Seeders;

use Illuminate\Database\Seeder;
use Plugins\SampleTestPlugin\Models\SampleModel;

class SamplePluginSeeder extends Seeder
{
    public function run(): void
    {
        $samples = [
            [
                'name' => 'Welcome Sample',
                'description' => 'Initial sample data created during plugin installation',
                'data' => [
                    'type' => 'welcome',
                    'priority' => 'high',
                    'tags' => ['welcome', 'initial', 'demo']
                ],
                'is_active' => true
            ],
            [
                'name' => 'Configuration Test',
                'description' => 'Sample for testing configuration handling',
                'data' => [
                    'type' => 'config_test',
                    'settings' => [
                        'enabled' => true,
                        'timeout' => 30,
                        'retries' => 3
                    ]
                ],
                'is_active' => true
            ],
            [
                'name' => 'API Integration Sample',
                'description' => 'Demonstrates API functionality',
                'data' => [
                    'type' => 'api_test',
                    'endpoints' => [
                        '/api/plugins/sample-test-plugin/data',
                        '/api/plugins/sample-test-plugin/status',
                        '/api/plugins/sample-test-plugin/test'
                    ]
                ],
                'is_active' => true
            ]
        ];

        foreach ($samples as $sample) {
            SampleModel::create($sample);
        }
    }
}