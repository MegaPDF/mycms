<?php

return [
    'name' => 'Hello World Plugin',
    'version' => '1.0.0',
    'debug' => env('APP_DEBUG', false),

    'features' => [
        'api_endpoints' => true,
        'web_interface' => true,
        'dynamic_loading' => true,
        'service_resolution' => true
    ],

    'settings' => [
        'default_greeting' => 'Hello, World!',
        'max_messages' => 100,
        'auto_greet' => true,
        'show_stats' => true
    ],

    'greetings' => [
        'en' => 'Hello, World!',
        'es' => 'Hola, Mundo!',
        'fr' => 'Bonjour, le Monde!',
        'de' => 'Hallo, Welt!',
        'it' => 'Ciao, Mondo!',
        'ja' => 'こんにちは、世界！',
        'zh' => '你好，世界！'
    ],

    'api' => [
        'rate_limit' => 60,
        'timeout' => 30
    ]
];