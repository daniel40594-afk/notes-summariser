'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            setSuccess(true);
            // Optional: Auto redirect to login after few seconds?
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="liquid-glass rounded-2xl shadow-2xl p-8 border border-white/10 text-center animate-fade-in-up">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 mb-6 glow-green">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Registration Successful</h2>
                <p className="text-sm text-gray-400 mb-6">
                    Current status: <span className="font-semibold text-orange-400">Pending Approval</span>
                </p>
                <div className="space-y-6">
                    <p className="text-gray-300">
                        Your account has been created. You will be able to access the dashboard once an administrator approves your account.
                    </p>
                    <Button
                        onClick={() => router.push('/login')}
                        className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                    >
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="liquid-glass rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 space-y-6">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
                    <p className="text-sm text-gray-400">
                        Enter your email below to get started
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
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>
            </div>

            <div className="px-8 py-4 bg-white/5 border-t border-white/5 text-center">
                <p className="text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-orange-500 hover:text-orange-400 hover:underline transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
