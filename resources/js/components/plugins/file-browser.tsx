import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Code, File, FileText, Folder, FolderOpen, Image, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FileItem {
    name: string;
    path: string;
    type: 'file' | 'directory';
    size?: number;
    modified: number;
    extension?: string;
    readable: boolean;
}

interface DirectoryData {
    type: 'directory';
    path: string;
    items: FileItem[];
}

interface FileData {
    type: 'file';
    path: string;
    name: string;
    extension: string;
    size: number;
    modified: number;
    content?: string;
    readable: boolean;
    reason?: string;
}

interface FileBrowserProps {
    pluginId: number;
}

export function FileBrowser({ pluginId }: FileBrowserProps) {
    const [currentPath, setCurrentPath] = useState('');
    const [data, setData] = useState<DirectoryData | FileData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

    const loadPath = async (path: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/admin/plugins/${pluginId}/files?path=${encodeURIComponent(path)}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to load files');
            }

            setData(result);
            setCurrentPath(path);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPath('');
    }, [pluginId]);

    const getFileIcon = (item: FileItem) => {
        if (item.type === 'directory') {
            return expandedDirs.has(item.path) ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />;
        }

        switch (item.extension) {
            case 'php':
            case 'js':
            case 'ts':
            case 'css':
                return <Code className="h-4 w-4" />;
            case 'json':
            case 'xml':
            case 'yml':
            case 'yaml':
                return <Settings className="h-4 w-4" />;
            case 'md':
            case 'txt':
                return <FileText className="h-4 w-4" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return <Image className="h-4 w-4" />;
            default:
                return <File className="h-4 w-4" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleItemClick = (item: FileItem) => {
        if (item.type === 'directory') {
            if (expandedDirs.has(item.path)) {
                setExpandedDirs((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(item.path);
                    return newSet;
                });
            } else {
                setExpandedDirs((prev) => new Set([...prev, item.path]));
            }
            loadPath(item.path);
        } else {
            loadPath(item.path);
        }
    };

    const navigateUp = () => {
        const pathParts = currentPath.split('/').filter(Boolean);
        pathParts.pop();
        const parentPath = pathParts.join('/');
        loadPath(parentPath);
    };

    const getBreadcrumbs = () => {
        if (!currentPath) return ['Root'];
        return ['Root', ...currentPath.split('/').filter(Boolean)];
    };

    if (loading && !data) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                        <span className="ml-2">Loading files...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center text-red-600">
                        <p>Error: {error}</p>
                        <Button variant="outline" onClick={() => loadPath('')} className="mt-2">
                            Retry
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Breadcrumb Navigation */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                        {getBreadcrumbs().map((crumb, index) => (
                            <div key={index} className="flex items-center">
                                {index > 0 && <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (index === 0) {
                                            loadPath('');
                                        } else {
                                            const pathParts = getBreadcrumbs().slice(1, index);
                                            loadPath(pathParts.join('/'));
                                        }
                                    }}
                                    className="h-auto p-1"
                                >
                                    {crumb}
                                </Button>
                            </div>
                        ))}
                        {currentPath && (
                            <Button variant="outline" size="sm" onClick={navigateUp} className="ml-4">
                                Up
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* File/Directory Content */}
            {data?.type === 'directory' ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Directory Contents</CardTitle>
                        <CardDescription>
                            {data.items.length} items in {currentPath || 'root directory'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {data.items.map((item) => (
                                <div
                                    key={item.path}
                                    className="flex cursor-pointer items-center justify-between rounded p-2 hover:bg-muted"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="flex items-center space-x-3">
                                        {getFileIcon(item)}
                                        <span className="font-medium">{item.name}</span>
                                        {item.extension && (
                                            <Badge variant="outline" className="text-xs">
                                                {item.extension}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                        {item.size && <span>{formatFileSize(item.size)}</span>}
                                        <span>{formatDate(item.modified)}</span>
                                        {!item.readable && (
                                            <Badge variant="secondary" className="text-xs">
                                                Binary
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {data.items.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Folder className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>This directory is empty</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : data?.type === 'file' ? (
                <div className="space-y-4">
                    {/* File Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getFileIcon(data)}
                                <span>{data.name}</span>
                            </CardTitle>
                            <CardDescription>
                                {formatFileSize(data.size)} • Modified {formatDate(data.modified)}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {/* File Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>File Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {data.readable && data.content ? (
                                <pre className="max-h-96 overflow-auto rounded bg-muted p-4 text-xs whitespace-pre-wrap">
                                    <code>{data.content}</code>
                                </pre>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground">
                                    <File className="mx-auto mb-4 h-12 w-12 opacity-50" />
                                    <p>{data.reason || 'File cannot be displayed'}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}
