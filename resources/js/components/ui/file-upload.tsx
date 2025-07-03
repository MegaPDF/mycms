
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number;
    className?: string;
    disabled?: boolean;
}

export function FileUpload({ onFileSelect, maxSize = 50 * 1024 * 1024, className, disabled = false }: FileUploadProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string>('');

    const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
        setError('');
        
        if (rejectedFiles.length > 0) {
            const rejection = rejectedFiles[0];
            if (rejection.errors[0]?.code === 'file-too-large') {
                setError(`File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`);
            } else if (rejection.errors[0]?.code === 'file-invalid-type') {
                setError('Invalid file type. Only ZIP files are allowed.');
            } else {
                setError('Invalid file.');
            }
            return;
        }

        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setSelectedFile(file);
            onFileSelect(file);
        }
    }, [onFileSelect, maxSize]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/zip': ['.zip'] },
        maxSize,
        multiple: false,
        disabled,
    });

    const clearFile = () => {
        setSelectedFile(null);
        setError('');
    };

    return (
        <div className={cn('w-full', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                    disabled && 'opacity-50 cursor-not-allowed',
                    error && 'border-destructive'
                )}
            >
                <Input {...getInputProps()} />
                
                {selectedFile ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            <span className="font-medium">{selectedFile.name}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div>
                            <p className="font-medium">
                                {isDragActive ? 'Drop the file here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                ZIP files only, up to {Math.round(maxSize / 1024 / 1024)}MB
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            {error && (
                <p className="mt-2 text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}