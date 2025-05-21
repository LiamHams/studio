import type { Tunnel } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit3, Trash2, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { EditTunnelDialog } from './EditTunnelDialog';
import { DeleteTunnelDialog } from './DeleteTunnelDialog';
import { Separator } from '../ui/separator';

interface TunnelCardProps {
  tunnel: Tunnel;
}

function StatusBadge({ status }: { status: Tunnel['status'] }) {
  switch (status) {
    case 'active':
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><Wifi className="mr-1 h-3 w-3" />Active</Badge>;
    case 'inactive':
      return <Badge variant="secondary"><WifiOff className="mr-1 h-3 w-3" />Inactive</Badge>;
    case 'error':
      return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3" />Error</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

export function TunnelCard({ tunnel }: TunnelCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-primary">{tunnel.name}</CardTitle>
          <StatusBadge status={tunnel.status} />
        </div>
        <CardDescription>Type: <span className="font-medium text-foreground">{tunnel.type.toUpperCase()}</span></CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 flex-grow">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">Local IP</h4>
          <p className="font-mono text-sm text-foreground">{tunnel.localIp}</p>
        </div>
        {tunnel.remoteIp && (
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground">Remote IP</h4>
            <p className="font-mono text-sm text-foreground">{tunnel.remoteIp}</p>
          </div>
        )}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground">Interface</h4>
          <p className="font-mono text-sm text-foreground">{tunnel.interfaceName}</p>
        </div>
      </CardContent>
      <Separator className="my-2"/>
      <CardFooter className="flex justify-end gap-2 pt-4">
        <EditTunnelDialog tunnel={tunnel}>
          <Button variant="outline" size="sm">
            <Edit3 className="mr-2 h-4 w-4" /> Edit
          </Button>
        </EditTunnelDialog>
        <DeleteTunnelDialog tunnel={tunnel}>
          <Button variant="destructive" size="sm" className="bg-destructive hover:bg-destructive/90">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </DeleteTunnelDialog>
      </CardFooter>
    </Card>
  );
}
