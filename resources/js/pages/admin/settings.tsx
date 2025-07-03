import { Head, useForm } from '@inertiajs/react';
import { Database, Globe, Mail, Palette, Save, Shield } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Settings',
        href: '/admin/settings',
    },
];

interface SettingsData {
    // General Settings
    site_name: string;
    site_description: string;
    site_url: string;
    admin_email: string;
    timezone: string;

    // Email Settings
    mail_driver: string;
    mail_host: string;
    mail_port: string;
    mail_username: string;
    mail_encryption: string;

    // Security Settings
    require_email_verification: boolean;
    enable_two_factor: boolean;
    session_timeout: number;
    max_login_attempts: number;

    // System Settings
    maintenance_mode: boolean;
    debug_mode: boolean;
    cache_enabled: boolean;
    log_level: string;

    [key: string]: string | number | boolean;
}

interface SettingsProps {
    settings: SettingsData;
    timezones: string[];
}

export default function Settings({ settings, timezones }: SettingsProps) {
    const { data, setData, put, processing, errors, isDirty, recentlySuccessful } = useForm<SettingsData>(settings);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('admin.settings.update'), {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Settings updated successfully');
            },
            onError: (errors) => {
                console.error('Settings update failed:', errors);
            },
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Settings" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Configure your application's core settings and preferences.</p>
                </div>

                <form onSubmit={submit}>
                    <Tabs defaultValue="general" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="general" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                General
                            </TabsTrigger>
                            <TabsTrigger value="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="system" className="flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                System
                            </TabsTrigger>
                            <TabsTrigger value="appearance" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Appearance
                            </TabsTrigger>
                        </TabsList>

                        {/* General Settings */}
                        <TabsContent value="general" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Site Information</CardTitle>
                                    <CardDescription>Basic information about your application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="site_name">Site Name</Label>
                                            <Input
                                                id="site_name"
                                                value={data.site_name}
                                                onChange={(e) => setData('site_name', e.target.value)}
                                                placeholder="My Application"
                                            />
                                            <InputError message={errors.site_name} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="site_url">Site URL</Label>
                                            <Input
                                                id="site_url"
                                                value={data.site_url}
                                                onChange={(e) => setData('site_url', e.target.value)}
                                                placeholder="https://myapp.com"
                                            />
                                            <InputError message={errors.site_url} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_description">Site Description</Label>
                                        <Textarea
                                            id="site_description"
                                            value={data.site_description}
                                            onChange={(e) => setData('site_description', e.target.value)}
                                            placeholder="A brief description of your application"
                                            rows={3}
                                        />
                                        <InputError message={errors.site_description} />
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="admin_email">Admin Email</Label>
                                            <Input
                                                id="admin_email"
                                                type="email"
                                                value={data.admin_email}
                                                onChange={(e) => setData('admin_email', e.target.value)}
                                                placeholder="admin@example.com"
                                            />
                                            <InputError message={errors.admin_email} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">Timezone</Label>
                                            <Select value={data.timezone} onValueChange={(value) => setData('timezone', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select timezone" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {timezones?.map((timezone) => (
                                                        <SelectItem key={timezone} value={timezone}>
                                                            {timezone}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.timezone} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Email Settings */}
                        <TabsContent value="email" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Configuration</CardTitle>
                                    <CardDescription>Configure how your application sends emails.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_driver">Mail Driver</Label>
                                            <Select value={data.mail_driver} onValueChange={(value) => setData('mail_driver', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="smtp">SMTP</SelectItem>
                                                    <SelectItem value="sendmail">Sendmail</SelectItem>
                                                    <SelectItem value="mailgun">Mailgun</SelectItem>
                                                    <SelectItem value="ses">Amazon SES</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_host">Mail Host</Label>
                                            <Input
                                                id="mail_host"
                                                value={data.mail_host}
                                                onChange={(e) => setData('mail_host', e.target.value)}
                                                placeholder="smtp.gmail.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_port">Port</Label>
                                            <Input
                                                id="mail_port"
                                                value={data.mail_port}
                                                onChange={(e) => setData('mail_port', e.target.value)}
                                                placeholder="587"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_username">Username</Label>
                                            <Input
                                                id="mail_username"
                                                value={data.mail_username}
                                                onChange={(e) => setData('mail_username', e.target.value)}
                                                placeholder="your-email@gmail.com"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="mail_encryption">Encryption</Label>
                                            <Select value={data.mail_encryption} onValueChange={(value) => setData('mail_encryption', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">TLS</SelectItem>
                                                    <SelectItem value="ssl">SSL</SelectItem>
                                                    <SelectItem value="null">None</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Security Settings */}
                        <TabsContent value="security" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Authentication & Security</CardTitle>
                                    <CardDescription>Configure security settings for user authentication.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Email Verification</Label>
                                            <p className="text-xs text-muted-foreground">Require users to verify their email addresses</p>
                                        </div>
                                        <Switch
                                            checked={data.require_email_verification}
                                            onCheckedChange={(checked) => setData('require_email_verification', checked)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Two-Factor Authentication</Label>
                                            <p className="text-xs text-muted-foreground">Enable two-factor authentication for enhanced security</p>
                                        </div>
                                        <Switch
                                            checked={data.enable_two_factor}
                                            onCheckedChange={(checked) => setData('enable_two_factor', checked)}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                                            <Input
                                                id="session_timeout"
                                                type="number"
                                                value={data.session_timeout}
                                                onChange={(e) => setData('session_timeout', parseInt(e.target.value))}
                                                min="1"
                                                max="1440"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                                            <Input
                                                id="max_login_attempts"
                                                type="number"
                                                value={data.max_login_attempts}
                                                onChange={(e) => setData('max_login_attempts', parseInt(e.target.value))}
                                                min="1"
                                                max="10"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* System Settings */}
                        <TabsContent value="system" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>System Configuration</CardTitle>
                                    <CardDescription>Advanced system settings and performance options.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Maintenance Mode</Label>
                                            <p className="text-xs text-muted-foreground">Put the application in maintenance mode</p>
                                        </div>
                                        <Switch checked={data.maintenance_mode} onCheckedChange={(checked) => setData('maintenance_mode', checked)} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Debug Mode</Label>
                                            <p className="text-xs text-muted-foreground">Enable debug mode (not recommended for production)</p>
                                        </div>
                                        <Switch checked={data.debug_mode} onCheckedChange={(checked) => setData('debug_mode', checked)} />
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Cache Enabled</Label>
                                            <p className="text-xs text-muted-foreground">Enable application caching for better performance</p>
                                        </div>
                                        <Switch checked={data.cache_enabled} onCheckedChange={(checked) => setData('cache_enabled', checked)} />
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <Label htmlFor="log_level">Log Level</Label>
                                        <Select value={data.log_level} onValueChange={(value) => setData('log_level', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="emergency">Emergency</SelectItem>
                                                <SelectItem value="alert">Alert</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="error">Error</SelectItem>
                                                <SelectItem value="warning">Warning</SelectItem>
                                                <SelectItem value="notice">Notice</SelectItem>
                                                <SelectItem value="info">Info</SelectItem>
                                                <SelectItem value="debug">Debug</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Appearance Settings */}
                        <TabsContent value="appearance" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance Settings</CardTitle>
                                    <CardDescription>Customize the visual appearance of your application.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border border-dashed p-4 text-center">
                                        <Palette className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <h3 className="mt-2 text-sm font-medium">Theme Management</h3>
                                        <p className="text-xs text-muted-foreground">Appearance settings are managed through the Themes section.</p>
                                        <Button variant="outline" size="sm" className="mt-2" asChild>
                                            <a href="/admin/themes">Manage Themes</a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Save Button */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">{isDirty ? 'You have unsaved changes' : 'Settings are up to date'}</p>
                                <p className="text-xs text-muted-foreground">
                                    {recentlySuccessful ? 'Settings saved successfully' : 'Changes will take effect immediately'}
                                </p>
                            </div>
                            <Button type="submit" disabled={processing || !isDirty}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </div>
                    </Tabs>
                </form>
            </div>
        </AdminLayout>
    );
}
