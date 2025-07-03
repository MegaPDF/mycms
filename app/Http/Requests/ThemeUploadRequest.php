<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ThemeUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->canManageThemes();
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:zip',
                'max:51200', // 50MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a theme file to upload.',
            'file.file' => 'The uploaded file is not valid.',
            'file.mimes' => 'Only ZIP files are allowed.',
            'file.max' => 'File size must not exceed 50MB.',
        ];
    }
}