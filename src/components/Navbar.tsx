"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import {
  BookOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Zap,
  ChevronDown,
  User,
  Briefcase,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-8 bg-secondary rounded-lg animate-pulse" />;
  }

  const current = themes.find((t) => t.id === theme)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
      >
        <span>{current.emoji}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-popover border border-border rounded-xl shadow-xl overflow-hidden w-44 py-1">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTheme(t.id); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors ${
                theme === t.id ? "bg-primary/10 text-primary font-semibold" : "text-foreground"
              }`}
            >
              <span className="text-base">{t.emoji}</span>
              {t.label}
              {theme === t.id && <span className="ml-auto text-primary">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { name: "Sheet", href: "/sheet", icon: <BookOpen className="w-4 h-4" /> },
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: "Workspace", href: "/workspace", icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl text-foreground shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex h-14 items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-lg tracking-tight text-primary hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <Zap className="w-5 h-5 fill-primary" />
          PrepTracker MNNIT
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {link.icon}
              <span className="hidden sm:inline">{link.name}</span>
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemePicker />

          {session ? (
            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium hidden md:block text-foreground truncate max-w-[120px]">
                {session.user?.name?.split(" ")[0]}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 text-sm font-medium bg-primary text-primary-foreground px-4 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden flex border-t border-border">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              pathname.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {link.icon}
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
