import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Power, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Plugin {
    id: number;
    name: string;
    version: string;
    description?: string;
    author?: string;
    is_active: boolean;
    installed_at: string;
}

interface PluginCardProps {
    plugin: Plugin;
}

export function PluginCard({ plugin }: PluginCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleToggle = () => {
        router.put(
            `/api/plugins/${plugin.id}/toggle`,
            {},
            {
                onFinish: () => router.reload(),
            },
        );
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/api/plugins/${plugin.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                router.reload();
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plugin.name}</CardTitle>
                    <Badge variant={plugin.is_active ? 'default' : 'secondary'}>{plugin.is_active ? 'Active' : 'Inactive'}</Badge>
                </div>
                <CardDescription>
                    Version {plugin.version}
                    {plugin.author && ` by ${plugin.author}`}
                </CardDescription>
            </CardHeader>

            {plugin.description && (
                <CardContent>
                    <p className="text-sm text-muted-foreground">{plugin.description}</p>
                </CardContent>
            )}

            <CardFooter className="flex gap-2">
                <Button variant={plugin.is_active ? 'outline' : 'default'} size="sm" onClick={handleToggle} className="flex-1">
                    <Power className="mr-2 h-4 w-4" />
                    {plugin.is_active ? 'Deactivate' : 'Activate'}
                </Button>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Plugin</DialogTitle>
                            <DialogDescription>Are you sure you want to delete "{plugin.name}"? This action cannot be undone.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    );
}
