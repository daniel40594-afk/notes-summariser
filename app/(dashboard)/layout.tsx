'use client';

import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white flex">
            {/* Background Particles for Dashboard too */}
            <ParticleBackground />

            <Sidebar />

            <main className="flex-1 ml-20 md:ml-64 transition-all duration-300 p-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
