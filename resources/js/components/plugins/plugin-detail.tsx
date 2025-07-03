// resources/js/pages/admin/plugin-detail.tsx

import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Activity, ArrowLeft, Calendar, Code, ExternalLink, FileText, Package, Play, Settings, Square, Trash2, User } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

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
                            <Button variant="outline" onClick={handleVisitPlugin}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Visit Plugin
                            </Button>
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

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Version</span>
                            </div>
                            <p className="text-2xl font-bold">{plugin.version}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Author</span>
                            </div>
                            <p className="text-2xl font-bold">{plugin.author || 'Unknown'}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Installed</span>
                            </div>
                            <p className="text-2xl font-bold">{format(new Date(plugin.installed_at), 'MMM d, yyyy')}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Status</span>
                            </div>
                            <p className={`text-2xl font-bold ${plugin.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                                {plugin.is_active ? 'Running' : 'Stopped'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Description */}
                {plugin.description && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Description</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg text-muted-foreground">{plugin.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Detailed Information Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        <TabsTrigger value="files">Files & Structure</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plugin Information</CardTitle>
                                <CardDescription>Basic information about this plugin</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Plugin Slug</label>
                                            <p className="mt-1 rounded bg-muted px-3 py-2 font-mono text-sm">{plugin.slug}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Installation Date</label>
                                            <p className="mt-1 text-sm">{format(new Date(plugin.installed_at), 'PPPP')}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                            <p className="mt-1 text-sm">{format(new Date(plugin.updated_at), 'PPPP')}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Current Status</label>
                                            <p className={`mt-1 text-sm font-medium ${plugin.is_active ? 'text-green-600' : 'text-gray-600'}`}>
                                                {plugin.is_active ? 'Active & Running' : 'Installed but Inactive'}
                                            </p>
                                        </div>
                                        {plugin.info?.features && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Features</label>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {plugin.info.features.map((feature: string, index: number) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="configuration" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Settings className="h-5 w-5" />
                                    <span>Plugin Configuration</span>
                                </CardTitle>
                                <CardDescription>Configuration settings and metadata</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {plugin.config ? (
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">{JSON.stringify(plugin.config, null, 2)}</pre>
                                ) : (
                                    <p className="text-muted-foreground">No configuration data available</p>
                                )}
                            </CardContent>
                        </Card>

                        {plugin.info && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plugin Info (from plugin.json)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">{JSON.stringify(plugin.info, null, 2)}</pre>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="files" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Code className="h-5 w-5" />
                                    <span>Files & Directory Structure</span>
                                </CardTitle>
                                <CardDescription>Plugin files and directory information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">File Path</label>
                                    <p className="mt-1 rounded bg-muted px-3 py-2 font-mono text-sm">{plugin.slug}</p>
                                </div>

                                {plugin.info?.assets && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Assets</label>
                                        <ul className="mt-2 space-y-1">
                                            {plugin.info.assets.map((asset: string, index: number) => (
                                                <li key={index} className="flex items-center text-sm text-muted-foreground">
                                                    <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                                                    {asset}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Expected Structure</label>
                                    <pre className="mt-2 rounded bg-muted p-3 text-xs text-muted-foreground">
                                        {`${plugin.slug}/
├── plugin.json
├── src/
│   ├── Providers/
│   ├── Controllers/
│   └── Models/
├── routes/
│   ├── web.php
│   └── api.php
├── resources/
│   ├── views/
│   ├── assets/
│   └── lang/
├── database/
│   └── migrations/
└── config/`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Activity Timeline</span>
                                </CardTitle>
                                <CardDescription>Plugin installation and modification history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="text-sm font-medium">Plugin Installed</p>
                                            <p className="text-xs text-muted-foreground">{format(new Date(plugin.installed_at), "PPPP 'at' p")}</p>
                                        </div>
                                    </div>

                                    {plugin.updated_at !== plugin.created_at && (
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
                                            <div>
                                                <p className="text-sm font-medium">Plugin Updated</p>
                                                <p className="text-xs text-muted-foreground">{format(new Date(plugin.updated_at), "PPPP 'at' p")}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-start space-x-3">
                                        <div className={`mt-2 h-2 w-2 rounded-full ${plugin.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <div>
                                            <p className="text-sm font-medium">Current Status</p>
                                            <p className="text-xs text-muted-foreground">
                                                Plugin is currently {plugin.is_active ? 'active and running' : 'inactive'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
