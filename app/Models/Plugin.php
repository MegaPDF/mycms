<?php
// app/Models/Plugin.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Plugin extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'version',
        'description',
        'author',
        'file_path',
        'config',
        'is_active',
        'is_installed',
        'installed_at',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'is_installed' => 'boolean',
        'installed_at' => 'datetime',
    ];

    protected function config(): Attribute
    {
        return Attribute::make(
            get: fn($value) => json_decode($value, true) ?: [],
            set: fn($value) => json_encode($value ?: []),
        );
    }

    public function activate(): bool
    {
        return $this->update(['is_active' => true]);
    }

    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    public function getConfigValue(string $key, $default = null)
    {
        return data_get($this->config, $key, $default);
    }

    public function setConfigValue(string $key, $value): void
    {
        $config = $this->config;
        data_set($config, $key, $value);
        $this->update(['config' => $config]);
    }
}
