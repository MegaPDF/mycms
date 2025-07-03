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
                                    <p className="text-xs text-muted-foreground">Upload a .zip file containing your plugin files.</p>
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
                                    {isUploading ? 'Uploading...' : 'Upload Plugin'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search plugins..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                {/* Plugin Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Plugins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{plugins.length}</div>
                            <p className="text-xs text-muted-foreground">Installed plugins</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Plugins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activePlugins.length}</div>
                            <p className="text-xs text-muted-foreground">Currently running</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inactive Plugins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{inactivePlugins.length}</div>
                            <p className="text-xs text-muted-foreground">Available to activate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Plugin Tabs */}
                <Tabs defaultValue="all" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="all">All Plugins ({filteredPlugins.length})</TabsTrigger>
                        <TabsTrigger value="active">Active ({activePlugins.length})</TabsTrigger>
                        <TabsTrigger value="inactive">Inactive ({inactivePlugins.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="space-y-4">
                        {filteredPlugins.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {filteredPlugins.map((plugin) => (
                                    <PluginCard key={plugin.id} plugin={plugin} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                                    <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-medium">No plugins found</h3>
                                    <p className="mb-4 text-sm text-muted-foreground">
                                        {searchTerm ? 'No plugins match your search criteria.' : 'Get started by uploading your first plugin.'}
                                    </p>
                                    {!searchTerm && (
                                        <Button onClick={() => setShowUploadDialog(true)}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Upload Plugin
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="active" className="space-y-4">
                        {activePlugins.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {activePlugins.map((plugin) => (
                                    <PluginCard key={plugin.id} plugin={plugin} />
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
                                    <PluginCard key={plugin.id} plugin={plugin} />
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
