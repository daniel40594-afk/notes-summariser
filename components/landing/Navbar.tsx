import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass-nav transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center glow-effect">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white hover:text-orange-500 transition-colors">
                            Celestial
                        </span>
                    </div>

                    {/* Center Links (Hidden on mobile) */}
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-8">
                            <Link href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Home
                            </Link>
                            <Link href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Products
                            </Link>
                            <Link href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>

                    {/* Right Buttons */}
                    <div className="flex items-center gap-4">
                        <Link href="/login">
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:border-orange-500/50 transition-all rounded-full px-6">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button className="bg-gradient-primary hover:opacity-90 text-white border-none rounded-full px-6 shadow-lg shadow-orange-500/20 transition-all transform hover:scale-105">
                                Sign Up
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
