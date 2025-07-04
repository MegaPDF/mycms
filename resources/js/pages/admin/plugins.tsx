// Fixed resources/js/pages/admin/plugins.tsx

import { Head, router } from '@inertiajs/react';
import { Package, Plus, Search, Upload } from 'lucide-react';
import { useState } from 'react';

import { PluginCard } from '@/components/plugins/PluginCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Plugins',
        href: '/admin/plugins',
    },
];

interface Plugin {
    id: number;
    name: string;
    slug: string;
    version: string;
    description?: string;
    author?: string;
    is_active: boolean;
    is_installed: boolean;
    installed_at: string;
    created_at: string;
    updated_at: string;
}

interface PluginsProps {
    plugins: Plugin[];
}

export default function Plugins({ plugins }: PluginsProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const activePlugins = plugins.filter((plugin) => plugin.is_active);
    const inactivePlugins = plugins.filter((plugin) => plugin.is_installed && !plugin.is_active);

    const filteredPlugins = plugins.filter(
        (plugin) =>
            plugin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plugin.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            plugin.author?.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // 🔧 FIX: Proper function that takes plugin parameter
    const handleViewDetails = (plugin: Plugin) => {
        console.log('🚀 navigating to plugin detail:', plugin.id);
        router.visit(`/admin/plugins/${plugin.id}`);
    };
    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        router.post('/api/plugins/upload', formData, {
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
            <Head title="Plugin Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">Plugin Management</h1>
                        <p className="text-muted-foreground">Install, configure, and manage your application plugins.</p>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Upload Plugin
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Upload New Plugin</DialogTitle>
                                <DialogDescription>Select a plugin zip file to upload and install.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="plugin-file">Plugin File</Label>
                                    <Input id="plugin-file" type="file" accept=".zip" onChange={handleFileSelect} />
                                    <p className="text-xs text-muted-foreground">Upload a ZIP file containing your plugin.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
                                    {isUploading ? (
                                        <>
                                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input placeholder="Search plugins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                    </div>
                </div>

                {/* Plugin Tabs */}
                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="active">Active ({activePlugins.length})</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive ({inactivePlugins.length})</TabsTrigger>
                        <TabsTrigger value="all">All ({plugins.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {activePlugins.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activePlugins.map((plugin) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onViewDetails={handleViewDetails} // 🔧 FIX: Pass the actual function
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">No active plugins</h3>
                                    <p className="text-sm text-muted-foreground">Activate plugins to extend your application's functionality.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="inactive" className="space-y-4">
                        {inactivePlugins.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {inactivePlugins.map((plugin) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onViewDetails={handleViewDetails} // 🔧 FIX: Pass the actual function
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">No inactive plugins</h3>
                                    <p className="text-sm text-muted-foreground">All installed plugins are currently active.</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4">
                        {filteredPlugins.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPlugins.map((plugin) => (
                                    <PluginCard
                                        key={plugin.id}
                                        plugin={plugin}
                                        onViewDetails={handleViewDetails} // 🔧 FIX: Pass the actual function
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">No plugins found</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {searchTerm ? 'Try adjusting your search terms.' : 'Upload your first plugin to get started.'}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Plugin Development Guide */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plugin Development Guidelines</CardTitle>
                        <CardDescription>Best practices for developing and packaging plugins.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Plugin Structure</h4>
                                <p className="text-xs text-muted-foreground">
                                    Include a plugin.json file with metadata, dependencies, and configuration options.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Security</h4>
                                <p className="text-xs text-muted-foreground">
                                    Follow security best practices and validate all user inputs in your plugins.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Testing</h4>
                                <p className="text-xs text-muted-foreground">
                                    Test plugins thoroughly before deployment to ensure compatibility and stability.
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Documentation</h4>
                                <p className="text-xs text-muted-foreground">
                                    Provide clear documentation for installation, configuration, and usage.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
