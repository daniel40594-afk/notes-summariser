'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    ChevronLeft,
    Users,
    FileText,
    Bot,
    Folder
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/;';
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Dashboard', href: '/user', icon: LayoutDashboard },
        { name: 'Workspaces', href: '/workspaces', icon: Folder }, // New
        { name: 'All Documents', href: '/documents', icon: FileText },
        { name: 'AI Study Tool', href: '/study', icon: BookOpen },
        { name: 'User Management', href: '/admin', icon: Users },
        // Settings moved to footer manually
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0a0a0a]",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex flex-col h-full relative">
                {/* Header / User Profile (Moved to TOP) */}
                <div className="p-4 border-b border-white/5">
                    <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange relative group cursor-pointer">
                            <span className="text-white font-bold text-lg">D</span>
                            {/* User Tooltip */}
                            {collapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                    Daniel (Pro)
                                </div>
                            )}
                        </div>
                        <div className={cn("flex-1 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
                            <p className="text-sm font-bold text-white truncate">Daniel</p>
                            <p className="text-xs text-gray-400 truncate">Pro Plan</p>
                        </div>
                        {/* Collapse Toggle (Desktop) */}
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className={cn(
                                "p-1 rounded-full text-gray-500 hover:text-white transition-colors hidden md:flex items-center justify-center",
                                collapsed ? "hidden" : "ml-auto"
                            )}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {/* Collapsed Toggle Button (When collapsed, show at top of nav or separately?) 
                        Actually, let's keep the Chevron logic simple above or below. 
                        If collapsed, the header is just the avatar. 
                        Let's put the toggle button outside or below user if needed. 
                        For now, clicking the avatar or a separate button could toggle? 
                        The user asked for "User at top". 
                        Let's keep the existing toggle button logic but adapted.
                    */}
                    {/* Toggle Button for Collapsed State */}
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="mx-auto mb-4 p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-colors flex justify-center w-full"
                        >
                            <ChevronLeft className="w-4 h-4 rotate-180" />
                        </button>
                    )}

                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/user' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-gradient-orange text-white shadow-lg shadow-orange-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "animate-pulse-glow")} />
                                <span className={cn("font-medium whitespace-nowrap transition-opacity duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                                    {item.name}
                                </span>

                                {/* Tooltip for collapsed state */}
                                {collapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / Settings & Logout (Moved to BOTTOM) */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    <Link
                        href="/user/settings"
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-gray-400 hover:text-white hover:bg-white/5",
                            pathname === '/user/settings' && "bg-white/5 text-white"
                        )}
                    >
                        <Settings className="w-5 h-5 shrink-0" />
                        <span className={cn("font-medium whitespace-nowrap transition-opacity duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            Settings
                        </span>
                        {collapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                Settings
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-gray-400 hover:text-red-400 hover:bg-red-500/10 w-full",
                        )}
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className={cn("font-medium whitespace-nowrap transition-opacity duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            Sign Out
                        </span>
                        {collapsed && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                Sign Out
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
}
