import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { router } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Theme {
    id: number;
    name: string;
    version: string;
    description?: string;
    author?: string;
    is_active: boolean;
    preview_image?: string;
}

interface ThemeCardProps {
    theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleActivate = () => {
        router.put(
            `/api/themes/${theme.id}/activate`,
            {},
            {
                onFinish: () => router.reload(),
            },
        );
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/api/themes/${theme.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                router.reload();
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <Card>
            {theme.preview_image && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img src={`/${theme.preview_image}`} alt={`${theme.name} preview`} className="h-full w-full object-cover" />
                </div>
            )}

            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                    <Badge variant={theme.is_active ? 'default' : 'secondary'}>{theme.is_active ? 'Active' : 'Available'}</Badge>
                </div>
                <CardDescription>
                    Version {theme.version}
                    {theme.author && ` by ${theme.author}`}
                </CardDescription>
            </CardHeader>

            {theme.description && (
                <CardContent>
                    <p className="text-sm text-muted-foreground">{theme.description}</p>
                </CardContent>
            )}

            <CardFooter className="flex gap-2">
                {!theme.is_active && (
                    <Button onClick={handleActivate} className="flex-1">
                        <Check className="mr-2 h-4 w-4" />
                        Activate
                    </Button>
                )}

                {!theme.is_active && (
                    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Theme</DialogTitle>
                                <DialogDescription>Are you sure you want to delete "{theme.name}"? This action cannot be undone.</DialogDescription>
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
                )}
            </CardFooter>
        </Card>
    );
}
