'use client';

import Link from 'next/link';
import { LogOut, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/auth'; // Server Action

export function Navbar() {
  const handleLogout = async () => {
    await logoutUser();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Settings2 className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-primary">TunnelVision</span>
        </Link>
        
        <form action={handleLogout}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Logout">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </form>
      </div>
    </header>
  );
}
