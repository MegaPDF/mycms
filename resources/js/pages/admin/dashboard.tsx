import { Head } from '@inertiajs/react';
import { BarChart3, Package, Palette, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Plugin {
    id: number;
    name: string;
    version: string;
    is_active: boolean;
    created_at: string;
}

interface Theme {
    id: number;
    name: string;
    version: string;
    is_active: boolean;
    created_at: string;
}

interface DashboardStats {
    users: number;
    plugins: number;
    active_plugins: number;
    themes: number;
    active_theme: string;
}

interface DashboardProps {
    stats: DashboardStats;
    recentPlugins: Plugin[];
    recentThemes: Theme[];
}

export default function Dashboard({ stats, recentPlugins, recentThemes }: DashboardProps) {
    const statCards = [
        {
            title: 'Total Users',
            value: stats.users.toLocaleString(),
            icon: Users,
            description: 'Registered users',
        },
        {
            title: 'Plugins',
            value: stats.plugins.toLocaleString(),
            icon: Package,
            description: `${stats.active_plugins} active`,
        },
        {
            title: 'Themes',
            value: stats.themes.toLocaleString(),
            icon: Palette,
            description: `Active: ${stats.active_theme}`,
        },
        {
            title: 'System Health',
            value: '100%',
            icon: BarChart3,
            description: 'All systems operational',
        },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to the admin dashboard. Here's an overview of your system.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((stat, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Plugins */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Plugins</CardTitle>
                            <CardDescription>Latest plugin activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentPlugins.length > 0 ? (
                                    recentPlugins.map((plugin) => (
                                        <div key={plugin.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{plugin.name}</p>
                                                <p className="text-xs text-muted-foreground">Version {plugin.version}</p>
                                            </div>
                                            <Badge variant={plugin.is_active ? 'default' : 'secondary'}>
                                                {plugin.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No plugins found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Themes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Themes</CardTitle>
                            <CardDescription>Latest theme activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentThemes.length > 0 ? (
                                    recentThemes.map((theme) => (
                                        <div key={theme.id} className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">{theme.name}</p>
                                                <p className="text-xs text-muted-foreground">Version {theme.version}</p>
                                            </div>
                                            <Badge variant={theme.is_active ? 'default' : 'secondary'}>
                                                {theme.is_active ? 'Active' : 'Available'}
                                            </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No themes found</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-dashed p-4 text-center">
                                <Package className="mx-auto h-8 w-8 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">Manage Plugins</h3>
                                <p className="text-xs text-muted-foreground">Install, activate, or configure plugins</p>
                            </div>
                            <div className="rounded-lg border border-dashed p-4 text-center">
                                <Palette className="mx-auto h-8 w-8 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">Manage Themes</h3>
                                <p className="text-xs text-muted-foreground">Switch or customize your theme</p>
                            </div>
                            <div className="rounded-lg border border-dashed p-4 text-center">
                                <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-medium">User Management</h3>
                                <p className="text-xs text-muted-foreground">Manage user accounts and permissions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
