'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Moon, Sun, Lock, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
    const [theme, setTheme] = useState('dark');
    const [loading, setLoading] = useState(false);

    // Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

    useEffect(() => {
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    const applyTheme = (t: string) => {
        if (t === 'light') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMsg({ type: '', text: '' });

        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/password-change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                setPasswordMsg({ type: 'success', text: 'Password updated successfully' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password' });
            }
        } catch (e) {
            setPasswordMsg({ type: 'error', text: 'Network error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up pb-20">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account preferences and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Theme Settings */}
                <Card className="border-white/10 relative overflow-hidden bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                            Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-400">Choose your preferred interface theme.</p>

                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => { if (theme !== 'dark') toggleTheme() }}
                                className={cn(
                                    "cursor-pointer w-full p-4 rounded-xl border border-white/10 bg-black transition-all",
                                    theme === 'dark' ? "ring-2 ring-orange-500" : "opacity-50 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-medium">Celestial Dark</span>
                                    {theme === 'dark' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                                </div>
                                <div className="h-2 bg-gray-800 rounded w-3/4 mb-1"></div>
                                <div className="h-2 bg-gray-900 rounded w-1/2"></div>
                            </div>

                            <div
                                onClick={() => { if (theme !== 'light') toggleTheme() }}
                                className={cn(
                                    "cursor-pointer w-full p-4 rounded-xl border border-transparent transition-all",
                                    theme === 'light' ? "ring-2 ring-[#7A3F91]" : "opacity-50 hover:opacity-100"
                                )}
                                style={{ backgroundColor: '#F2EAF7' }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium" style={{ color: '#7A3F91' }}>Custom Light</span>
                                    {theme === 'light' && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#7A3F91' }}></div>}
                                </div>
                                <div className="h-2 rounded w-3/4 mb-1" style={{ backgroundColor: '#C59DD9' }}></div>
                                <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#E0C8EB' }}></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Password Settings */}
                <Card className="border-white/10 relative overflow-hidden bg-white/5">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-orange-500" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Current Password</label>
                                <Input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">New Password</label>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Confirm New Password</label>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-black/20 border-white/10 text-white"
                                    required
                                />
                            </div>

                            {passwordMsg.text && (
                                <div className={cn(
                                    "text-sm p-3 rounded-lg flex items-center gap-2",
                                    passwordMsg.type === 'success' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                )}>
                                    {passwordMsg.text}
                                </div>
                            )}

                            <Button type="submit" disabled={loading} className="w-full bg-gradient-orange text-white">
                                {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
