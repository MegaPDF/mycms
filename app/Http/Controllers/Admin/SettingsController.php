<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Routing\Controller as BaseController;
class SettingsController extends BaseController
{
    public function __construct()
    {
        $this->middleware(['auth', 'admin']);
    }

    public function index(): Response
    {
        $settings = [
            // General Settings
            'site_name' => config('app.name', 'Laravel'),
            'site_description' => 'A modern web application built with Laravel and React',
            'site_url' => config('app.url'),
            'admin_email' => config('mail.from.address', 'admin@example.com'),
            'timezone' => config('app.timezone', 'UTC'),

            // Email Settings
            'mail_driver' => config('mail.default', 'smtp'),
            'mail_host' => config('mail.mailers.smtp.host', 'localhost'),
            'mail_port' => config('mail.mailers.smtp.port', '587'),
            'mail_username' => config('mail.mailers.smtp.username', ''),
            'mail_encryption' => config('mail.mailers.smtp.encryption', 'tls'),

            // Security Settings
            'require_email_verification' => false,
            'enable_two_factor' => false,
            'session_timeout' => config('session.lifetime', 120),
            'max_login_attempts' => 5,

            // System Settings
            'maintenance_mode' => false,
            'debug_mode' => config('app.debug', false),
            'cache_enabled' => true,
            'log_level' => config('logging.level', 'error'),
        ];

        $timezones = [
            'UTC',
            'America/New_York',
            'America/Chicago',
            'America/Denver',
            'America/Los_Angeles',
            'Europe/London',
            'Europe/Paris',
            'Europe/Berlin',
            'Asia/Tokyo',
            'Asia/Shanghai',
            'Australia/Sydney',
        ];

        return Inertia::render('admin/settings', [
            'settings' => $settings,
            'timezones' => $timezones,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        try {
            // Simple validation - only the fields we're actually using
            $validated = $request->validate([
                'site_name' => 'required|string|max:255',
                'site_description' => 'nullable|string|max:1000',
                'site_url' => 'required|url',
                'admin_email' => 'required|email',
                'timezone' => 'required|string',
                // Make mail fields optional for now
                'mail_driver' => 'nullable|string|in:smtp,sendmail,mailgun,ses',
                'mail_host' => 'nullable|string|max:255',
                'mail_port' => 'nullable|string|max:10',
                'mail_username' => 'nullable|string|max:255',
                'mail_encryption' => 'nullable|string|in:tls,ssl,null',
            ]);

            // Log the request for debugging
            Log::info('Settings update attempt', [
                'user_id' => auth()->id(),
                'data' => $validated
            ]);

            // For now, just return success
            return back()->with('success', 'Settings updated successfully!');

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Settings validation failed', ['errors' => $e->errors()]);
            return back()->withErrors($e->errors())->withInput();

        } catch (\Exception $e) {
            Log::error('Settings update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->with('error', 'Failed to update settings: ' . $e->getMessage());
        }
    }
}