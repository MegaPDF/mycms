<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Theme extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'version',
        'description',
        'author',
        'file_path',
        'preview_image',
        'config',
        'is_active',
        'is_default',
    ];

    protected $casts = [
        'config' => 'array',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
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
        // Deactivate all other themes first
        static::where('id', '!=', $this->id)->update(['is_active' => false]);

        return $this->update(['is_active' => true]);
    }

    public function deactivate(): bool
    {
        return $this->update(['is_active' => false]);
    }

    public static function getActive()
    {
        return static::where('is_active', true)->first();
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