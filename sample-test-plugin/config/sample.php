<?php

return [
    'name' => 'Sample Test Plugin',
    'version' => '1.0.0',
    'debug' => env('APP_DEBUG', false),

    'features' => [
        'api_endpoints' => true,
        'web_interface' => true,
        'database_storage' => true,
        'asset_management' => true,
        'middleware_support' => true,
        'caching' => true,
        'internationalization' => true,
        'migrations' => true,
        'seeders' => true
    ],

    'settings' => [
        'default_message' => 'Hello from Sample Test Plugin!',
        'cache_duration' => 3600,
        'max_samples' => 1000,
        'auto_cleanup' => true,
        'cleanup_days' => 30
    ],

    'database' => [
        'table_prefix' => 'sample_plugin_',
        'connection' => env('DB_CONNECTION', 'mysql')
    ],

    'assets' => [
        'css' => [
            'sample.css'
        ],
        'js' => [
            'sample.js'
        ]
    ],

    'permissions' => [
        'view_plugin' => ['admin', 'super_admin'],
        'manage_samples' => ['admin', 'super_admin'],
        'access_api' => ['admin', 'super_admin', 'user']
    ]
];