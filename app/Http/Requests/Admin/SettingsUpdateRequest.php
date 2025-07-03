<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingsUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() &&
            (auth()->user()->isAdmin() || auth()->user()->isSuperAdmin());
    }

    public function rules(): array
    {
        return [
            // General Settings
            'site_name' => ['required', 'string', 'max:255'],
            'site_description' => ['nullable', 'string', 'max:1000'],
            'site_url' => ['required', 'url', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255'],
            'timezone' => ['required', 'string', 'max:255'],

            // Email Settings
            'mail_driver' => ['required', 'string', 'in:smtp,sendmail,mailgun,ses'],
            'mail_host' => ['nullable', 'string', 'max:255'],
            'mail_port' => ['nullable', 'string', 'max:10'],
            'mail_username' => ['nullable', 'string', 'max:255'],
            'mail_encryption' => ['nullable', 'string', 'in:tls,ssl,null'],

            // Security Settings
            'require_email_verification' => ['sometimes', 'boolean'],
            'enable_two_factor' => ['sometimes', 'boolean'],
            'session_timeout' => ['required', 'integer', 'between:1,1440'], // 1 minute to 24 hours
            'max_login_attempts' => ['required', 'integer', 'between:1,10'],

            // System Settings
            'maintenance_mode' => ['sometimes', 'boolean'],
            'debug_mode' => ['sometimes', 'boolean'],
            'cache_enabled' => ['sometimes', 'boolean'],
            'log_level' => ['required', 'string', 'in:emergency,alert,critical,error,warning,notice,info,debug'],
        ];
    }

    public function messages(): array
    {
        return [
            'site_name.required' => 'Site name is required.',
            'site_url.required' => 'Site URL is required.',
            'site_url.url' => 'Site URL must be a valid URL.',
            'admin_email.required' => 'Admin email is required.',
            'admin_email.email' => 'Admin email must be a valid email address.',
            'timezone.required' => 'Timezone is required.',
            'mail_driver.required' => 'Mail driver is required.',
            'mail_driver.in' => 'Mail driver must be one of: smtp, sendmail, mailgun, ses.',
            'mail_port.between' => 'Mail port must be between 1 and 65535.',
            'session_timeout.between' => 'Session timeout must be between 1 and 1440 minutes.',
            'max_login_attempts.between' => 'Max login attempts must be between 1 and 10.',
            'log_level.in' => 'Log level must be a valid level.',
        ];
    }

    public function attributes(): array
    {
        return [
            'site_name' => 'site name',
            'site_description' => 'site description',
            'site_url' => 'site URL',
            'admin_email' => 'admin email',
            'mail_driver' => 'mail driver',
            'mail_host' => 'mail host',
            'mail_port' => 'mail port',
            'mail_username' => 'mail username',
            'mail_encryption' => 'mail encryption',
            'require_email_verification' => 'email verification requirement',
            'enable_two_factor' => 'two-factor authentication',
            'session_timeout' => 'session timeout',
            'max_login_attempts' => 'maximum login attempts',
            'maintenance_mode' => 'maintenance mode',
            'debug_mode' => 'debug mode',
            'cache_enabled' => 'cache status',
            'log_level' => 'log level',
        ];
    }
}