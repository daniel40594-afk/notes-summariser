'use client';

import React from 'react';

export default function ParticleBackground() {
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Large Orbiting Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-celestial-orange/5 blur-[100px] animate-pulse-glow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-celestial-orange/5 blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

            {/* Floating Particles */}
            <div className="absolute top-[20%] left-[15%] w-2 h-2 rounded-full bg-celestial-orange opacity-40 blur-[1px] animate-float" style={{ animationDuration: '7s' }}></div>
            <div className="absolute top-[60%] left-[5%] w-3 h-3 rounded-full bg-celestial-orange/60 opacity-30 blur-[2px] animate-float" style={{ animationDuration: '9s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-[20%] right-[20%] w-4 h-4 rounded-full bg-celestial-orange/40 opacity-20 blur-[3px] animate-float" style={{ animationDuration: '11s' }}></div>
            <div className="absolute top-[30%] right-[30%] w-1.5 h-1.5 rounded-full bg-white opacity-20 animate-float" style={{ animationDuration: '8s', animationDelay: '3s' }}></div>

            {/* Random small dots */}
            <div className="absolute top-[10%] left-[40%] w-1 h-1 rounded-full bg-white/10 animate-float" style={{ animationDuration: '15s' }}></div>
            <div className="absolute bottom-[40%] right-[40%] w-1 h-1 rounded-full bg-celestial-orange/20 animate-float" style={{ animationDuration: '13s' }}></div>
        </div>
    );
}
