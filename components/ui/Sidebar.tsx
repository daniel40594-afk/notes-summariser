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
    Menu,
    Users,
    FileText,
    Bot
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
        { name: 'AI Study Tool', href: '/study', icon: BookOpen },
        { name: 'Documents', href: '/documents', icon: FileText },
        { name: 'Document Chat', href: '/chat', icon: Bot },
        { name: 'User Management', href: '/admin', icon: Users },
        { name: 'Settings', href: '/user/settings', icon: Settings }, // Placeholder
    ];

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-50 h-screen transition-all duration-300 ease-in-out border-r border-white/5 bg-[#0a0a0a]",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex flex-col h-full relative">
                {/* Header / Toggle */}
                <div className="flex items-center justify-between p-4 h-16 border-b border-white/5">
                    <div className={cn("flex items-center gap-3 overflow-hidden transition-all duration-300", collapsed ? "justify-center w-full" : "justify-start")}>
                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center glow-orange">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className={cn("font-bold text-xl text-white tracking-tight whitespace-nowrap transition-all duration-300 origin-left", collapsed ? "opacity-0 w-0 scale-0" : "opacity-100 w-auto scale-100")}>
                            Celestial
                        </span>
                    </div>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={cn(
                            "absolute right-[-12px] top-6 p-1 rounded-full bg-zinc-800 text-gray-400 hover:text-white border border-white/10 transition-colors hidden md:flex items-center justify-center z-50",
                        )}
                    >
                        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", collapsed && "rotate-180")} />
                    </button>
                </div>

                {/* Mobile Collapse Button (Only shown when collapsed to expand) */}
                {collapsed && (
                    <div className="flex justify-center py-2 md:block hidden">
                        <button
                            onClick={() => setCollapsed(false)}
                            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
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
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer / User */}
                <div className="p-4 border-t border-white/5">
                    <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
                        <div className="w-9 h-9 shrink-0 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center">
                            <span className="text-gray-400 text-sm font-medium">JD</span>
                        </div>
                        <div className={cn("flex-1 overflow-hidden transition-all duration-300", collapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            <p className="text-sm font-medium text-white truncate">John Doe</p>
                            <p className="text-xs text-gray-500 truncate">Pro Plan</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={cn(
                                "text-gray-400 hover:text-red-400 transition-colors",
                                collapsed ? "hidden group-hover:block absolute" : ""
                            )}
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
