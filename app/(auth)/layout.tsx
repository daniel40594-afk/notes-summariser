import React from 'react';
import ParticleBackground from '@/components/ui/ParticleBackground';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <ParticleBackground />
            <div className="w-full max-w-md space-y-8 relative z-10 animate-fade-in-up">
                {children}
            </div>
        </div>
    );
}
