import { Head, router } from '@inertiajs/react';
import { Palette, Plus, Upload } from 'lucide-react';
import { useState } from 'react';

import { ThemeCard } from '@/components/themes/ThemeCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Themes',
        href: '/admin/themes',
    },
];

interface Theme {
    id: number;
    name: string;
    slug: string;
    version: string;
    description?: string;
    author?: string;
    is_active: boolean;
    is_default: boolean;
    preview_image?: string;
    created_at: string;
    updated_at: string;
}

interface ThemesProps {
    themes: Theme[];
}

export default function Themes({ themes }: ThemesProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const activeTheme = themes.find((theme) => theme.is_active);
    const availableThemes = themes.filter((theme) => !theme.is_active);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        router.post('/api/themes/upload', formData, {
            onSuccess: () => {
                setShowUploadDialog(false);
                setSelectedFile(null);
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
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Theme Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Theme Management</h1>
                        <p className="text-muted-foreground">Manage and customize your application themes.</p>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Theme
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload New Theme</DialogTitle>
                                <DialogDescription>Select a theme zip file to upload and install.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="theme-file">Theme File</Label>
                                    <Input id="theme-file" type="file" accept=".zip" onChange={handleFileSelect} />
                                    <p className="text-xs text-muted-foreground">Upload a .zip file containing your theme files.</p>
                                </div>
                                {selectedFile && (
                                    <div className="rounded-lg border p-3">
                                        <div className="flex items-center gap-2">
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{selectedFile.name}</span>
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                                    {isUploading ? 'Uploading...' : 'Upload Theme'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Active Theme */}
                {activeTheme && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold">Active Theme</h2>
                            <Badge>Current</Badge>
                        </div>
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                            <ThemeCard theme={activeTheme} />
                        </div>
                    </div>
                )}

                {/* Available Themes */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Available Themes</h2>
                    {availableThemes.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {availableThemes.map((theme) => (
                                <ThemeCard key={theme.id} theme={theme} />
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle>No Additional Themes</CardTitle>
                                <CardDescription>You currently have no additional themes installed.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <Palette className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <p className="mb-4 text-sm text-muted-foreground">Upload a new theme to get started with customization.</p>
                                    <Button onClick={() => setShowUploadDialog(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Upload Theme
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Theme Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle>Theme Guidelines</CardTitle>
                        <CardDescription>Important information about theme development and installation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Theme Structure</h4>
                                <p className="text-xs text-muted-foreground">
                                    Themes should include a theme.json configuration file with metadata and styling information.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">File Format</h4>
                                <p className="text-xs text-muted-foreground">
                                    Upload themes as .zip files containing all necessary assets and configuration.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Compatibility</h4>
                                <p className="text-xs text-muted-foreground">
                                    Ensure themes are compatible with the current system version for optimal performance.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Preview Images</h4>
                                <p className="text-xs text-muted-foreground">
                                    Include a preview.png image in your theme package for better identification.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
