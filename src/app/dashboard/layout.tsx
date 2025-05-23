import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
// import { protectedRoute } from '@/lib/auth'; // Removed

export const metadata: Metadata = {
  title: 'Dashboard - TunnelVision',
  description: 'Manage your network tunnels.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // await protectedRoute(); // Removed: Middleware handles protection for /dashboard

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
