import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, BarChart3, Database, RefreshCw, TrendingUp } from 'lucide-react';

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

interface DashboardData {
    message?: string;
    status?: string;
    version?: string;
    stats?: { [key: string]: any };
    metrics?: { [key: string]: any };
    recent_activity?: any[];
    quick_stats?: { [key: string]: any };
    models?: { [key: string]: any };
    data_source?: string;
    note?: string;
    [key: string]: any;
}

interface PluginDashboardProps {
    plugin: Plugin;
    pluginInfo: PluginInfo;
    dashboardData: DashboardData;
}

export default function PluginDashboard({ plugin, pluginInfo, dashboardData }: PluginDashboardProps) {
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
            title: 'Dashboard',
            href: `/admin/plugins/${plugin.id}/dashboard`,
        },
    ];

    const handleRefresh = () => {
        window.location.reload();
    };

    const renderStats = () => {
        const stats = dashboardData.stats || dashboardData.quick_stats || {};

        if (Object.keys(stats).length === 0) {
            return <p className="text-sm text-muted-foreground">No statistics available</p>;
        }

        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(stats).map(([key, value]) => (
                    <Card key={key}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    const renderMetrics = () => {
        const metrics = dashboardData.metrics || {};

        if (Object.keys(metrics).length === 0) {
            return <p className="text-sm text-muted-foreground">No metrics available</p>;
        }

        return (
            <div className="grid gap-2">
                {Object.entries(metrics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <Badge variant="outline">{value}</Badge>
                    </div>
                ))}
            </div>
        );
    };

    const renderRecentActivity = () => {
        const activity = dashboardData.recent_activity || [];

        if (activity.length === 0) {
            return <p className="text-sm text-muted-foreground">No recent activity</p>;
        }

        return (
            <div className="space-y-3">
                {activity.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 rounded-lg bg-muted p-3">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium">{typeof item === 'string' ? item : item.action || item.message || 'Activity'}</p>
                            {typeof item === 'object' && item.timestamp && <p className="text-xs text-muted-foreground">{item.timestamp}</p>}
                        </div>
                        {typeof item === 'object' && item.status && (
                            <Badge variant={item.status === 'success' ? 'default' : 'secondary'}>{item.status}</Badge>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderModels = () => {
        const models = dashboardData.models || {};

        if (Object.keys(models).length === 0) {
            return <p className="text-sm text-muted-foreground">No model data available</p>;
        }

        return (
            <div className="space-y-4">
                {Object.entries(models).map(([modelName, data]) => (
                    <Card key={modelName}>
                        <CardHeader>
                            <CardTitle className="text-lg capitalize">{modelName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Total Records</span>
                                    <Badge>{data.total || 0}</Badge>
                                </div>
                                {data.recent && data.recent.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-sm font-medium">Recent Records</p>
                                        <div className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                                            <pre>{JSON.stringify(data.recent, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`${plugin.name} - Dashboard`} />

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
                            <h1 className="text-3xl font-bold">{plugin.name} Dashboard</h1>
                            <Badge variant="default">{dashboardData.status || 'Active'}</Badge>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Main Message */}
                {dashboardData.message && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Activity className="h-5 w-5" />
                                <span>Status</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg">{dashboardData.message}</p>
                            {dashboardData.data_source && (
                                <p className="mt-2 text-sm text-muted-foreground">Data source: {dashboardData.data_source}</p>
                            )}
                            {dashboardData.note && (
                                <div className="mt-3 rounded-lg bg-muted p-3">
                                    <p className="text-sm text-muted-foreground">{dashboardData.note}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Statistics */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Statistics</h2>
                    {renderStats()}
                </div>

                {/* Dashboard Tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Plugin Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Plugin Information</CardTitle>
                                    <CardDescription>Basic plugin details and status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Name</span>
                                        <span className="text-sm font-medium">{plugin.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Version</span>
                                        <span className="text-sm font-medium">{dashboardData.version || plugin.version}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Status</span>
                                        <Badge variant="default">{dashboardData.status || 'Active'}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Actions</CardTitle>
                                    <CardDescription>Common plugin management tasks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => (window.location.href = `/admin/plugins/${plugin.id}/interface`)}
                                    >
                                        View Plugin Interface
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => window.open(`/plugins/${plugin.slug}`, '_blank')}
                                    >
                                        Visit Plugin Page
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start" onClick={handleRefresh}>
                                        Refresh Dashboard
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="metrics" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <BarChart3 className="h-5 w-5" />
                                    <span>Performance Metrics</span>
                                </CardTitle>
                                <CardDescription>Plugin performance and usage metrics</CardDescription>
                            </CardHeader>
                            <CardContent>{renderMetrics()}</CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="activity" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5" />
                                    <span>Recent Activity</span>
                                </CardTitle>
                                <CardDescription>Latest plugin activities and events</CardDescription>
                            </CardHeader>
                            <CardContent>{renderRecentActivity()}</CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data" className="space-y-4">
                        {/* Models Data */}
                        {dashboardData.models && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Database className="h-5 w-5" />
                                        <span>Model Data</span>
                                    </CardTitle>
                                    <CardDescription>Plugin database models and records</CardDescription>
                                </CardHeader>
                                <CardContent>{renderModels()}</CardContent>
                            </Card>
                        )}

                        {/* Raw Dashboard Data */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Raw Dashboard Data</CardTitle>
                                <CardDescription>Complete dashboard data for debugging</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(dashboardData, null, 2)}</pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
