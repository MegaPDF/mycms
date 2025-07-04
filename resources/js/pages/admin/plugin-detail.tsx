import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Activity, ArrowLeft, Calendar, ExternalLink, Package, Play, Settings, Square, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

// Import the FileBrowser component
import { FileBrowser } from '@/components/plugins/file-browser';

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
    config?: any;
    info?: any;
}

interface PluginDetailProps {
    plugin: Plugin;
}

export default function PluginDetail({ plugin }: PluginDetailProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Plugins',
            href: '/admin/plugins',
        },
        {
            title: plugin.name,
            href: `/admin/plugins/${plugin.id}`,
        },
    ];

    const handleToggle = () => {
        const action = plugin.is_active ? 'deactivate' : 'activate';

        router.put(
            `/admin/plugins/${plugin.id}/toggle`,
            {},
            {
                onSuccess: () => {
                    toast.success(`Plugin ${action}d successfully!`);
                },
                onError: () => {
                    toast.error(`Failed to ${action} plugin`);
                },
            },
        );
    };

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${plugin.name}"? This action cannot be undone.`)) {
            return;
        }

        router.delete(`/admin/plugins/${plugin.id}`, {
            onSuccess: () => {
                toast.success('Plugin deleted successfully!');
                router.visit('/admin/plugins');
            },
            onError: () => {
                toast.error('Failed to delete plugin');
            },
        });
    };

    const handleVisitPlugin = () => {
        if (plugin.is_active) {
            window.open(`/plugins/${plugin.slug}`, '_blank');
        }
    };

    const handleViewInterface = () => {
        router.visit(`/admin/plugins/${plugin.id}/interface`);
    };

    const handleViewDashboard = () => {
        router.visit(`/admin/plugins/${plugin.id}/dashboard`);
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${plugin.name} - Plugin Details`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin/plugins">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Plugins
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className={`h-4 w-4 rounded-full ${plugin.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <h1 className="text-3xl font-bold">{plugin.name}</h1>
                            <Badge variant={plugin.is_active ? 'default' : 'secondary'}>{plugin.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {plugin.is_active && (
                            <>
                                <Button variant="outline" onClick={handleViewInterface}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Interface
                                </Button>
                                <Button variant="outline" onClick={handleViewDashboard}>
                                    <Activity className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Button>
                                <Button variant="outline" onClick={handleVisitPlugin}>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Visit Plugin
                                </Button>
                            </>
                        )}
                        <Button variant="outline" onClick={handleToggle}>
                            {plugin.is_active ? (
                                <>
                                    <Square className="mr-2 h-4 w-4" />
                                    Deactivate
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Activate
                                </>
                            )}
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Plugin Information */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        <TabsTrigger value="files">Files</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Plugin Information</CardTitle>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Name</p>
                                            <p className="text-sm font-medium">{plugin.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Version</p>
                                            <p className="text-sm font-medium">{plugin.version}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Slug</p>
                                            <p className="text-sm font-medium">{plugin.slug}</p>
                                        </div>
                                        {plugin.author && (
                                            <div>
                                                <p className="text-xs text-muted-foreground">Author</p>
                                                <p className="text-sm font-medium">{plugin.author}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">State</p>
                                            <Badge variant={plugin.is_active ? 'default' : 'secondary'}>
                                                {plugin.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Installed</p>
                                            <Badge variant={plugin.is_installed ? 'default' : 'secondary'}>
                                                {plugin.is_installed ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Dates */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Installed</p>
                                            <p className="text-sm">
                                                {plugin.installed_at ? format(new Date(plugin.installed_at), 'MMM d, yyyy HH:mm') : 'Not installed'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">Created</p>
                                            <p className="text-sm">{format(new Date(plugin.created_at), 'MMM d, yyyy HH:mm')}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        {plugin.description && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Description</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{plugin.description}</p>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plugin Details</CardTitle>
                                <CardDescription>Technical information about this plugin</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {plugin.info && (
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium">Plugin Info</h4>
                                            <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(plugin.info, null, 2)}</pre>
                                        </div>
                                    )}
                                    {plugin.config && (
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium">Configuration</h4>
                                            <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(plugin.config, null, 2)}</pre>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="configuration" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                                <CardDescription>Plugin configuration and settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {plugin.config ? (
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium">Current Configuration</h4>
                                            <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">
                                                {JSON.stringify(plugin.config, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="border-t pt-4">
                                            <h4 className="mb-2 text-sm font-medium">Configuration Summary</h4>
                                            <div className="grid gap-2">
                                                {Object.entries(plugin.config).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between rounded bg-muted p-2">
                                                        <span className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                                                        <span className="text-sm text-muted-foreground">
                                                            {typeof value === 'object' && value !== null ? `${Object.keys(value).length} items` : String(value)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No configuration data available for this plugin.</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="files" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plugin Files & Structure</CardTitle>
                                <CardDescription>Browse plugin files and directory structure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileBrowser pluginId={plugin.id} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
