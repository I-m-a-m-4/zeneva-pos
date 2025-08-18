
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Rocket, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white overflow-hidden relative">
      <div className="absolute inset-0 z-0">
        {/* Starfield */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(2px 2px at 90% 70%, white, transparent),
            radial-gradient(2px 2px at 30% 90%, white, transparent),
            radial-gradient(1px 1px at 10% 80%, white, transparent),
            radial-gradient(1px 1px at 60% 40%, white, transparent),
            radial-gradient(2px 2px at 40% 20%, white, transparent)
          `,
          backgroundSize: '100% 100%',
          animation: 'twinkle 20s linear infinite',
        }} />
      </div>
      
      <style jsx>{`
        @keyframes twinkle {
          0% { background-position: 0 0; }
          100% { background-position: -1000px 500px; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(-45deg); }
          50% { transform: translateY(-20px) rotate(-35deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fire-flicker {
          0% { transform: scaleY(1) translateY(0); opacity: 1; }
          50% { transform: scaleY(0.8) translateY(5px); opacity: 0.8; }
          100% { transform: scaleY(1) translateY(0); opacity: 1; }
        }
        .fire-trail {
          width: 24px;
          height: 60px;
          background: linear-gradient(to top, #ffda79, #ffb142, #ff793f, transparent);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          transform: rotate(180deg) translateX(50%) translateY(20px);
          position: absolute;
          left: -4px; /* Adjust based on rocket size */
          bottom: 0px; /* Adjust based on rocket size */
          z-index: -1;
          filter: blur(2px);
          animation: fire-flicker 0.15s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 text-center p-6">
        <div className="animate-float relative inline-block mb-8">
          <Rocket className="w-24 h-24 text-primary" style={{ transform: 'rotate(-45deg)' }} />
          <div className="fire-trail"></div>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold font-mono tracking-tighter mb-4 text-gradient-primary-accent">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-6">
          You've Drifted Into Uncharted Space
        </h2>
        <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
          The page you're looking for seems to be lost in the cosmos. Let's get you back on course.
        </p>
        <Button asChild size="lg" className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Return to Mission Control
          </Link>
        </Button>
      </div>
    </div>
  );
}
