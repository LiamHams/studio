import type { Metadata } from 'next';
import { Navbar } from '@/components/shared/Navbar';
import { protectedRoute } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard - TunnelVision',
  description: 'Manage your network tunnels.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await protectedRoute(); // Protects this layout and its children

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
