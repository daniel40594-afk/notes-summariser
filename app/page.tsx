import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-orange-500 selection:text-white">
      <Navbar />
      <Hero />
    </main>
  );
}
