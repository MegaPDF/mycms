<?php
// app/Services/FileUploadService.php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;

class FileUploadService
{
    protected array $allowedMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
    ];

    protected int $maxFileSize = 52428800; // 50MB

    public function validateFile(UploadedFile $file): array
    {
        $errors = [];

        // Check file size
        if ($file->getSize() > $this->maxFileSize) {
            $errors[] = 'File size exceeds 50MB limit.';
        }

        // Check MIME type
        if (!in_array($file->getMimeType(), $this->allowedMimeTypes)) {
            $errors[] = 'Only ZIP files are allowed.';
        }

        // Check file extension
        if (strtolower($file->getClientOriginalExtension()) !== 'zip') {
            $errors[] = 'File must have .zip extension.';
        }

        return $errors;
    }

    public function uploadFile(UploadedFile $file, string $directory): string
    {
        $filename = Str::uuid() . '.zip';
        $path = $file->storeAs($directory, $filename, 'local');

        return $path;
    }

    public function extractZip(string $zipPath, string $extractTo): bool
    {
        $zip = new ZipArchive;
        $fullZipPath = Storage::disk('local')->path($zipPath);

        if ($zip->open($fullZipPath) === TRUE) {
            // Security check: prevent directory traversal
            for ($i = 0; $i < $zip->numFiles; $i++) {
                $filename = $zip->getNameIndex($i);
                if (strpos($filename, '..') !== false) {
                    $zip->close();
                    throw new \Exception('Invalid file path detected in ZIP archive.');
                }
            }

            $extractPath = Storage::disk('local')->path($extractTo);
            File::ensureDirectoryExists($extractPath);

            $result = $zip->extractTo($extractPath);
            $zip->close();

            return $result;
        }

        return false;
    }
    public function scanForMaliciousFilesInPlugin(string $directory): array
    {
        // For plugins, only block truly dangerous files, not PHP
        $maliciousPatterns = [
            '*.exe',
            '*.bat',
            '*.sh',
            '*.ps1',
            '*.scr',
            '*.com',
            '*.pif'
        ];

        $suspiciousFiles = [];
        $path = Storage::disk('local')->path($directory);

        foreach ($maliciousPatterns as $pattern) {
            $files = glob($path . '/**/' . $pattern, GLOB_BRACE);
            foreach ($files as $file) {
                $suspiciousFiles[] = str_replace($path . '/', '', $file);
            }
        }

        return $suspiciousFiles;
    }

    public function deleteFile(string $path): bool
    {
        return Storage::disk('local')->delete($path);
    }

    public function deleteDirectory(string $directory): bool
    {
        return Storage::disk('local')->deleteDirectory($directory);
    }
}
