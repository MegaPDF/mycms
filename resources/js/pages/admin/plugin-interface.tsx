import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Code, Database, ExternalLink, Globe, Settings } from 'lucide-react';

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
}

interface PluginInfo {
    name?: string;
    version?: string;
    description?: string;
    author?: string;
    features?: string[];
    [key: string]: any;
}

interface PluginData {
    message?: string;
    status?: string;
    version?: string;
    features?: string[] | { [key: string]: string };
    configuration?: any;
    structure?: { [key: string]: string };
    method?: string;
    note?: string;
    [key: string]: any;
}

interface PluginInterfaceProps {
    plugin: Plugin;
    pluginInfo: PluginInfo;
    pluginData: PluginData;
}

export default function PluginInterface({ plugin, pluginInfo, pluginData }: PluginInterfaceProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Plugins',
            href: '/admin/plugins',
        },
        {
            title: plugin.name,
            href: `/admin/plugins/${plugin.id}`,
        },
        {
            title: 'Interface',
            href: `/admin/plugins/${plugin.id}/interface`,
        },
    ];

    const handleVisitPlugin = () => {
        window.open(`/plugins/${plugin.slug}`, '_blank');
    };

    const renderFeatures = () => {
        const features = pluginData.features || pluginInfo.features || [];

        if (Array.isArray(features)) {
            return (
                <div className="grid gap-2">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm">{feature}</span>
                        </div>
                    ))}
                </div>
            );
        } else if (typeof features === 'object') {
            return (
                <div className="grid gap-2">
                    {Object.entries(features).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                            <span className="text-sm">{key}</span>
                            <Badge variant={value === 'Available' || value === true ? 'default' : 'secondary'}>
                                {typeof value === 'boolean' ? (value ? 'Available' : 'Not Available') : value}
                            </Badge>
                        </div>
                    ))}
                </div>
            );
        }

        return <p className="text-sm text-muted-foreground">No features information available</p>;
    };

    const renderStructure = () => {
        if (!pluginData.structure) {
            return <p className="text-sm text-muted-foreground">No structure information available</p>;
        }

        return (
            <div className="grid gap-2">
                {Object.entries(pluginData.structure).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <Badge variant={value === 'Available' ? 'default' : 'secondary'}>{value}</Badge>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${plugin.name} - Interface`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={`/admin/plugins/${plugin.id}`}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Details
                            </Button>
                        </Link>
                        <div className="flex items-center space-x-3">
                            <div className="h-4 w-4 rounded-full bg-green-500" />
                            <h1 className="text-3xl font-bold">{plugin.name} Interface</h1>
                            <Badge variant="default">Active</Badge>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleVisitPlugin}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Plugin
                        </Button>
                    </div>
                </div>

                {/* Plugin Interface Data */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Main Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Plugin Information</span>
                            </CardTitle>
                            <CardDescription>Current plugin status and details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {pluginData.message && (
                                <div>
                                    <p className="text-sm font-medium">Message</p>
                                    <p className="text-sm text-muted-foreground">{pluginData.message}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge variant={pluginData.status === 'active' ? 'default' : 'secondary'}>{pluginData.status || 'Unknown'}</Badge>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Version</p>
                                    <p className="text-sm text-muted-foreground">{pluginData.version || plugin.version}</p>
                                </div>
                            </div>

                            {pluginData.method && (
                                <div>
                                    <p className="text-sm font-medium">Data Source</p>
                                    <Badge variant="outline">{pluginData.method}</Badge>
                                </div>
                            )}

                            {pluginData.note && (
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="text-xs text-muted-foreground">{pluginData.note}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Features */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Code className="h-5 w-5" />
                                <span>Features</span>
                            </CardTitle>
                            <CardDescription>Available plugin features and capabilities</CardDescription>
                        </CardHeader>
                        <CardContent>{renderFeatures()}</CardContent>
                    </Card>
                </div>

                {/* Detailed Information */}
                <Tabs defaultValue="structure" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="structure">Structure</TabsTrigger>
                        <TabsTrigger value="configuration">Configuration</TabsTrigger>
                        <TabsTrigger value="data">Raw Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="structure" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Database className="h-5 w-5" />
                                    <span>Plugin Structure</span>
                                </CardTitle>
                                <CardDescription>File structure and components analysis</CardDescription>
                            </CardHeader>
                            <CardContent>{renderStructure()}</CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="configuration" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration Management</CardTitle>
                                <CardDescription>View and manage plugin configuration settings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {pluginData.configuration ? (
                                    <div className="space-y-6">
                                        {Object.entries(pluginData.configuration).map(([configName, configData]) => (
                                            <div key={configName} className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-lg font-medium capitalize">{configName} Configuration</h4>
                                                    <Badge variant="outline">{configName}.php</Badge>
                                                </div>

                                                {typeof configData === 'object' && configData !== null ? (
                                                    <div className="space-y-4">
                                                        {/* Configuration Summary Cards */}
                                                        <div className="grid gap-4 md:grid-cols-2">
                                                            {Object.entries(configData).map(([section, sectionData]) => (
                                                                <Card key={section} className="p-4">
                                                                    <h5 className="mb-2 font-medium capitalize">{section.replace(/_/g, ' ')}</h5>
                                                                    {typeof sectionData === 'object' && sectionData !== null ? (
                                                                        <div className="space-y-2">
                                                                            {Object.entries(sectionData).map(([key, value]) => (
                                                                                <div key={key} className="flex justify-between text-sm">
                                                                                    <span className="text-muted-foreground">
                                                                                        {key.replace(/_/g, ' ')}:
                                                                                    </span>
                                                                                    <span className="font-medium">
                                                                                        {typeof value === 'boolean'
                                                                                            ? value
                                                                                                ? 'Enabled'
                                                                                                : 'Disabled'
                                                                                            : typeof value === 'object'
                                                                                              ? `${value && typeof value === 'object' ? Object.keys(value).length : 0} items`
                                                                                              : String(value)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-muted-foreground">{String(sectionData)}</p>
                                                                    )}
                                                                </Card>
                                                            ))}
                                                        </div>

                                                        {/* Special handling for greetings if available */}
                                                        {configData.greetings && (
                                                            <Card className="p-4">
                                                                <h5 className="mb-3 font-medium">Available Greetings</h5>
                                                                <div className="grid gap-2 md:grid-cols-2">
                                                                    {Object.entries(configData.greetings).map(([lang, greeting]) => (
                                                                        <div
                                                                            key={lang}
                                                                            className="flex items-center justify-between rounded bg-muted p-2"
                                                                        >
                                                                            <Badge variant="outline">{lang.toUpperCase()}</Badge>
                                                                            <span className="text-sm">{String(greeting)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </Card>
                                                        )}

                                                        {/* Raw Configuration Data */}
                                                        <details className="group">
                                                            <summary className="cursor-pointer text-sm font-medium text-muted-foreground group-open:mb-3">
                                                                View Raw Configuration
                                                            </summary>
                                                            <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs">
                                                                {JSON.stringify(configData, null, 2)}
                                                            </pre>
                                                        </details>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Configuration data is not in expected format.</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Settings className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">No configuration data available for this plugin.</p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            Configuration files may be missing or not loaded properly.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Raw Plugin Data</CardTitle>
                                <CardDescription>Complete plugin data for debugging</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">Plugin Info (from plugin.json)</h4>
                                        <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                                            {JSON.stringify(pluginInfo, null, 2)}
                                        </pre>
                                    </div>
                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">Runtime Data</h4>
                                        <pre className="max-h-48 overflow-auto rounded bg-muted p-3 text-xs">
                                            {JSON.stringify(pluginData, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plugin Actions</CardTitle>
                        <CardDescription>Available actions for this plugin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-2">
                            <Button variant="outline" onClick={handleVisitPlugin}>
                                <Globe className="mr-2 h-4 w-4" />
                                Visit Plugin Page
                            </Button>
                            <Button variant="outline" onClick={() => (window.location.href = `/admin/plugins/${plugin.id}/dashboard`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                View Dashboard
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
