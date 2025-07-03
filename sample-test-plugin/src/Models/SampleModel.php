<?php

namespace Plugins\SampleTestPlugin\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;

class SampleModel extends Model
{
    use HasFactory;

    protected $table = 'sample_plugin_data';

    protected $fillable = [
        'name',
        'description',
        'data',
        'is_active'
    ];

    protected $casts = [
        'data' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Scope for active samples.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for recent samples.
     */
    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('created_at', '>=', Carbon::now()->subDays($days));
    }

    /**
     * Get formatted creation date.
     */
    public function getFormattedCreatedAtAttribute(): string
    {
        return $this->created_at->format('M j, Y g:i A');
    }

    /**
     * Get data size in bytes.
     */
    public function getDataSizeAttribute(): int
    {
        return strlen(json_encode($this->data ?? []));
    }
}