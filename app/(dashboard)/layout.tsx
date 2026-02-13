'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, LogOut, User } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        document.cookie = 'token=; Max-Age=0; path=/;';
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            <nav className="border-b border-zinc-800 bg-[#0a0a0a] px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white hover:text-orange-500 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center glow-effect">
                                <span className="text-white font-bold text-lg">C</span>
                            </div>
                            <span>Celestial</span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-4">
                            <Link href="/user" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Dashboard</Link>
                            <Link href="/study" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">AI Study Tool</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400 mr-4">
                            <User className="h-4 w-4" />
                            <span>Account</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleLogout} className="text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white">
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                {children}
            </main>
        </div>
    );
}
