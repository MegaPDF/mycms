import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUpload } from '@/components/ui/file-upload';
import { router } from '@inertiajs/react';
import { Upload } from 'lucide-react';
import { useState } from 'react';

export function PluginUpload() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        router.post('/api/plugins/upload', formData, {
            onSuccess: () => {
                setIsOpen(false);
                setSelectedFile(null);
                // Refresh the page to show updated plugins
                router.reload();
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            },
            onFinish: () => {
                setIsUploading(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Plugin
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Upload Plugin</DialogTitle>
                    <DialogDescription>Select a ZIP file containing your plugin to upload.</DialogDescription>
                </DialogHeader>

                <FileUpload onFileSelect={setSelectedFile} disabled={isUploading} />

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
