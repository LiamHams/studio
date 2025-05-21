import type { Tunnel } from '@/types';
import { TunnelCard } from './TunnelCard';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TunnelListProps {
  tunnels: Tunnel[];
}

export function TunnelList({ tunnels }: TunnelListProps) {
  if (tunnels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Tunnels Found</h3>
        <p className="text-muted-foreground">
          Get started by adding a new 6to4 or IPv6 tunnel.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tunnels.map((tunnel) => (
        <TunnelCard key={tunnel.id} tunnel={tunnel} />
      ))}
    </div>
  );
}
