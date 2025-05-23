
'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Tunnel } from '@/types';

interface TunnelFormFieldsProps {
  defaultValues?: Partial<Tunnel>;
  errors?: Record<string, string[] | undefined>;
  isPending?: boolean;
}

export function TunnelFormFields({ defaultValues, errors, isPending }: TunnelFormFieldsProps) {
  // No need to manage tunnelType in state here if not affecting other fields dynamically beyond what CSS/validation handles
  // const [tunnelType, setTunnelType] = React.useState(defaultValues?.type || 'ipip6');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Tunnel Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={defaultValues?.name} 
          placeholder="e.g., My Home Tunnel" 
          required 
          disabled={isPending}
        />
        {errors?.name && <p className="text-sm text-destructive mt-1">{errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="type">Tunnel Type</Label>
        <Select 
          name="type" 
          defaultValue={defaultValues?.type || 'ipip6'} 
          // onValueChange={(value: Tunnel['type']) => setTunnelType(value)} // Not strictly needed if form re-renders on type change
          required
          disabled={isPending}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select tunnel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ipip6">IPv6-in-IPv6 Tunnel (ipip6)</SelectItem>
            <SelectItem value="6to4">6to4 Tunnel</SelectItem>
            <SelectItem value="gre6">GRE-over-IPv6 Tunnel (gre6)</SelectItem>
          </SelectContent>
        </Select>
        {errors?.type && <p className="text-sm text-destructive mt-1">{errors.type[0]}</p>}
      </div>
      <div>
        <Label htmlFor="localIp">Local Endpoint IP</Label>
        <Input 
          id="localIp" 
          name="localIp" 
          defaultValue={defaultValues?.localIp} 
          placeholder="e.g., 192.168.1.100 or 2001:db8::1" 
          required 
          disabled={isPending}
          className="font-mono"
        />
        {errors?.localIp && <p className="text-sm text-destructive mt-1">{errors.localIp[0]}</p>}
      </div>
      
      <div>
        <Label htmlFor="remoteIp">Remote Endpoint IP</Label>
        <Input
          id="remoteIp"
          name="remoteIp"
          defaultValue={defaultValues?.remoteIp}
          placeholder="e.g., 203.0.113.1 or 2001:db8::2"
          required
          disabled={isPending}
          className="font-mono"
        />
        {errors?.remoteIp && <p className="text-sm text-destructive mt-1">{errors.remoteIp[0]}</p>}
      </div>

      <div>
        <Label htmlFor="assignedIp">IP Assigned to Tunnel (with CIDR)</Label>
        <Input 
          id="assignedIp" 
          name="assignedIp" 
          defaultValue={defaultValues?.assignedIp} 
          placeholder="e.g., 10.0.0.1/24 or fd00::1/64" 
          required 
          disabled={isPending}
          className="font-mono"
        />
        {errors?.assignedIp && <p className="text-sm text-destructive mt-1">{errors.assignedIp[0]}</p>}
      </div>

      <div>
        <Label htmlFor="mtu">MTU (Maximum Transmission Unit)</Label>
        <Input 
          id="mtu" 
          name="mtu" 
          type="number"
          defaultValue={defaultValues?.mtu} 
          placeholder="e.g., 1480 (optional)" 
          disabled={isPending}
          className="font-mono"
        />
        {errors?.mtu && <p className="text-sm text-destructive mt-1">{errors.mtu[0]}</p>}
      </div>

      <div>
        <Label htmlFor="interfaceName">Interface Name</Label>
        <Input 
          id="interfaceName" 
          name="interfaceName" 
          defaultValue={defaultValues?.interfaceName} 
          placeholder="e.g., he-ipv6, sit1, tun0" 
          required 
          disabled={isPending}
          className="font-mono"
        />
        {errors?.interfaceName && <p className="text-sm text-destructive mt-1">{errors.interfaceName[0]}</p>}
      </div>
    </div>
  );
}
