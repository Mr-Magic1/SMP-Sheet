import Link from 'next/link';
import Image from 'next/image';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6 flex flex-col items-center">
        {/* Giant 404 Text */}
        <h1 className="text-8xl md:text-[10rem] font-black tracking-tighter text-foreground leading-none">
          404
        </h1>
        
        {/* Custom Text mimicking the user's requested style */}
        <div className="space-y-1">
          <p className="text-xl md:text-2xl font-light text-foreground lowercase tracking-wide">
            oops...
          </p>
          <p className="text-xl md:text-2xl font-light text-foreground lowercase tracking-wide">
            page not found
          </p>
        </div>

        {/* The generated robot doodle */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 -mt-4 mix-blend-multiply dark:invert opacity-90">
          <Image
            src="/404-robot.jpg"
            alt="Sad broken robot"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Back to Home Button */}
        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-primary/25"
          >
            <Home className="w-5 h-5" />
            <span>Go Back Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
