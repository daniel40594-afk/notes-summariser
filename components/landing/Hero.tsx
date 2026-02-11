import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

            {/* Floating Particles (Simulated with simple divs for now) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce delay-100"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-orange-500/20 rounded-full animate-bounce delay-700"></div>
                <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-bounce delay-300"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

                <div className="space-y-8 animate-fade-in-up">
                    <h2 className="text-orange-500 font-semibold tracking-wide uppercase text-sm md:text-base animate-slide-up">
                        Future of Productivity
                    </h2>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                        <span className="block">Landing Page</span>
                        <span className="text-gradient block mt-2">Creative Design</span>
                    </h1>

                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 leading-relaxed">
                        Experience the next generation of dashboard interfaces.
                        Built with precision, designed for speed, and styled for the future.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
                        <Link href="/signup">
                            <Button className="h-14 px-8 text-lg bg-gradient-primary hover:opacity-90 text-white rounded-full shadow-xl shadow-orange-500/20 transition-all transform hover:scale-105 flex items-center gap-2 group">
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>


                    </div>
                </div>

            </div>

            {/* Diagonal Grid Overlay (Optional) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
        </section>
    );
}
