import { router } from '@inertiajs/react';
import { Eye, MoreVertical, Play, Settings, Square, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

    const handleToggle = () => {
        if (isToggling) return;
        setIsToggling(true);
        const action = plugin.is_active ? 'deactivate' : 'activate';

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
                    toast.error(`Failed to ${action} plugin`, {
                        description: typeof errors === 'string' ? errors : 'An unexpected error occurred',
                    });
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
                toast.error('Failed to delete plugin', {
                    description: typeof errors === 'string' ? errors : 'An unexpected error occurred',
                });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    // ✅ FIXED: Admin-only plugin interface
    const handlePluginInterface = () => {
        if (!plugin.is_active) {
            toast.error('Plugin must be active to view interface');
            return;
        }
        router.visit(`/admin/plugins/${plugin.id}/interface`);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Card clicked, calling onViewDetails for:', plugin.name);
        onViewDetails(plugin);
    };

    const handleDropdownViewDetails = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onViewDetails(plugin);
    };

    const handleDropdownInterface = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handlePluginInterface();
    };

    const handleDropdownToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleToggle();
    };

    const handleDropdownDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleDelete();
    };

    return (
        <Card className="relative cursor-pointer transition-shadow hover:shadow-md">
            <div onClick={handleCardClick} className="w-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className={`h-3 w-3 rounded-full ${plugin.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <CardTitle className="text-lg">{plugin.name}</CardTitle>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={handleDropdownViewDetails}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                </DropdownMenuItem>

                                {/* ✅ FIXED: Admin plugin interface instead of external link */}
                                {plugin.is_active && (
                                    <DropdownMenuItem onClick={handleDropdownInterface}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Plugin Interface
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuItem onClick={handleDropdownToggle} disabled={isToggling}>
                                    {plugin.is_active ? (
                                        <>
                                            <Square className="mr-2 h-4 w-4" />
                                            {isToggling ? 'Deactivating...' : 'Deactivate'}
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            {isToggling ? 'Activating...' : 'Activate'}
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDropdownDelete}
                                    disabled={isDeleting}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Version</span>
                            <span className="font-mono">{plugin.version}</span>
                        </div>
                        {plugin.author && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Author</span>
                                <span>{plugin.author}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={plugin.is_active ? 'default' : 'secondary'}>{plugin.is_active ? 'Active' : 'Inactive'}</Badge>
                        </div>
                        {plugin.description && (
                            <div className="mt-3">
                                <p className="line-clamp-2 text-sm text-muted-foreground">{plugin.description}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
