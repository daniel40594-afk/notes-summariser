'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Check role/status to redirect appropriately
            // For now, let middleware handle redirections or just go to /user
            // But we can check here to give better UX
            if (data.user.role === 'admin') {
                router.push('/admin');
            } else if (data.user.status === 'approved') {
                router.push('/user');
            } else {
                // Even if logged in, if pending, middleware might block /user
                // But let's try to go to /user and let middleware handle it
                // Or redirect to a pending page
                router.push('/user');
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="liquid-glass rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
                    <p className="text-sm text-gray-400">
                        Sign in to your Celestial account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                            className="bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-orange-500/50"
                        />
                    </div>
                    {error && (
                        <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-md text-sm border border-red-500/20">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    <Button
                        type="submit"
                        className="w-full h-11 bg-gradient-orange hover:opacity-90 text-white font-medium shadow-lg shadow-orange-500/20"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>
            </div>

            <div className="px-8 py-4 bg-white/5 border-t border-white/5 text-center">
                <p className="text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-400 hover:underline transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
