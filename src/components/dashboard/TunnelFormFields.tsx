'use client';

import type * as React from 'react';
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
  const [tunnelType, setTunnelType] = React.useState(defaultValues?.type || 'ipv6');

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Tunnel Name</Label>
        <Input 
          id="name" 
          name="name" 
          defaultValue={defaultValues?.name} 
          placeholder="e.g., My Home IPv6" 
          required 
          disabled={isPending}
        />
        {errors?.name && <p className="text-sm text-destructive mt-1">{errors.name[0]}</p>}
      </div>
      <div>
        <Label htmlFor="type">Tunnel Type</Label>
        <Select 
          name="type" 
          defaultValue={defaultValues?.type || 'ipv6'} 
          onValueChange={(value: '6to4' | 'ipv6') => setTunnelType(value)}
          required
          disabled={isPending}
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select tunnel type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ipv6">IPv6 Tunnel</SelectItem>
            <SelectItem value="6to4">6to4 Tunnel</SelectItem>
          </SelectContent>
        </Select>
        {errors?.type && <p className="text-sm text-destructive mt-1">{errors.type[0]}</p>}
      </div>
      <div>
        <Label htmlFor="localIp">Local IP Address</Label>
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
      {tunnelType === 'ipv6' && (
        <div>
          <Label htmlFor="remoteIp">Remote IP Address (for IPv6)</Label>
          <Input
            id="remoteIp"
            name="remoteIp"
            defaultValue={defaultValues?.remoteIp}
            placeholder="e.g., 2001:db8::2"
            disabled={isPending}
            className="font-mono"
          />
          {errors?.remoteIp && <p className="text-sm text-destructive mt-1">{errors.remoteIp[0]}</p>}
        </div>
      )}
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
