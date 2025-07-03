// resources/js/components/plugins/PluginCard.tsx
import { router } from '@inertiajs/react';
import { ExternalLink, Eye, MoreVertical, Play, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface PluginCardProps {
    plugin: Plugin;
    onViewDetails: (plugin: Plugin) => void;
}

export function PluginCard({ plugin, onViewDetails }: PluginCardProps) {
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const handleViewDetails = () => {
        router.visit(`/admin/plugins/${plugin.id}`);
    };
    const handleToggle = () => {
        if (isToggling) return;

        setIsToggling(true);
        const action = plugin.is_active ? 'deactivate' : 'activate';

        // ✅ Use PUT method
        router.put(
            `/api/plugins/${plugin.id}/toggle`,
            {},
            {
                onSuccess: () => {
                    toast.success(`Plugin ${action}d successfully!`, {
                        description: `${plugin.name} is now ${plugin.is_active ? 'inactive' : 'active'}`,
                    });
                    router.reload();
                },
                onError: (errors) => {
                    toast.error(`Failed to ${action} plugin`, { description: typeof errors === 'string' ? errors : 'An unexpected error occurred' });
                },
                onFinish: () => {
                    setIsToggling(false);
                },
            },
        );
    };

    const handleDelete = () => {
        if (isDeleting) return;

        if (!confirm(`Are you sure you want to delete "${plugin.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);

        router.delete(`/api/plugins/${plugin.id}`, {
            onSuccess: () => {
                toast.success('Plugin deleted successfully!', {
                    description: `${plugin.name} has been removed`,
                });
                router.reload();
            },
            onError: (errors) => {
                toast.error('Failed to delete plugin', { description: typeof errors === 'string' ? errors : 'An unexpected error occurred' });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleVisitPlugin = () => {
        if (plugin.is_active) {
            window.open(`/plugins/${plugin.slug}`, '_blank');
        }
    };

    return (
        <Card className="relative cursor-pointer transition-shadow hover:shadow-md">
            {/* Click anywhere on card to view details */}
            <div onClick={() => onViewDetails(plugin)}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`h-3 w-3 rounded-full ${plugin.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <CardTitle className="text-lg">{plugin.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails(plugin);
                                    }}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>
                                {plugin.is_active && (
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleVisitPlugin();
                                        }}
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Visit Plugin
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle();
                                    }}
                                    disabled={isToggling}
                                >
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
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete();
                                    }}
                                    disabled={isDeleting}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent>
                    <CardDescription className="mb-2">{plugin.description || 'No description available'}</CardDescription>

                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>v{plugin.version}</span>
                        {plugin.author && <span>by {plugin.author}</span>}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
