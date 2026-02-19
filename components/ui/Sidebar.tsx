'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    LogOut,
    Menu,
    Users,
    FileText,
    Folder,
    Globe
} from 'lucide-react';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [role, setRole] = useState('user');
    const pathname = usePathname();

    useEffect(() => {
        // Fetch user role for sidebar visibility
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) setRole(data.user.role);
                }
            } catch (e) { console.error(e); }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/;';
        window.location.href = '/login';
    };

    const navItems = [
        { name: 'Dashboard', href: '/user', icon: LayoutDashboard },
        { name: 'Workspaces', href: '/workspaces', icon: Folder },
        { name: 'Document Chat', href: '/documents', icon: FileText },
        { name: 'Deep Search', href: '/chat?deepSearch=true', icon: Globe },
        { name: 'AI Study Tool', href: '/study', icon: BookOpen },
    ];

    // Only add User Management if admin
    if (role === 'admin' || role === 'Admin') {
        navItems.push({ name: 'User Management', href: '/admin', icon: Users });
    }

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-white/5 bg-zinc-950",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex flex-col h-full relative">
                {/* Header Section */}
                <div className="p-4 border-b border-white/5">
                    {/* Collapsed Layout: Menu Icon TOP, Profile BELOW */}
                    {collapsed ? (
                        <div className="flex flex-col items-center gap-6">
                            {/* Menu Icon (Toggle) */}
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-2 rounded-lg text-gray-500 hover:text-white transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>

                            {/* Profile Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange cursor-pointer group relative">
                                <span className="text-white font-bold text-lg">D</span>
                                {/* Hover Tooltip */}
                                <div className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                                    Daniel ({role === 'admin' ? 'Admin' : 'Pro'})
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Expanded Layout: Menu Icon NEXT TO Profile Name */
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange overflow-hidden">
                                <span className="text-white font-bold text-lg">D</span>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-white truncate">Daniel</p>
                                    {/* Menu Icon (Toggle) Next to Name */}
                                    <button
                                        onClick={() => setCollapsed(!collapsed)}
                                        className="p-1 rounded-full text-gray-500 hover:text-white transition-colors ml-auto"
                                    >
                                        <Menu className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 truncate capitalize">{role} Plan</p>
                            </div>
                        </div>
                    )}
                </div>



                {/* Search Bar - Only Visible When Expanded */}
                {!collapsed && (
                    <div className="px-3 pb-2 animate-fade-in">
                        <form action="/chat" method="GET" className="relative group">
                            <input
                                type="text"
                                name="initialQuery"
                                placeholder="Search web..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-orange-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <input type="hidden" name="deepSearch" value="true" />
                        </form>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const safePathname = pathname || '';
                        const isActive = safePathname === item.href || (item.href !== '/user' && safePathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-gradient-orange text-white shadow-lg shadow-orange-500/20"
                                        : "text-gray-400 hover:text-white hover:bg-white/5",
                                    collapsed && "justify-center"
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

                {/* Footer */}
                <div className="p-3 border-t border-white/5 space-y-1">
                    <Link
                        href="/user/settings"
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative text-gray-400 hover:text-white hover:bg-white/5",
                            pathname === '/user/settings' && "bg-white/5 text-white",
                            collapsed && "justify-center"
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
                            collapsed && "justify-center"
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
