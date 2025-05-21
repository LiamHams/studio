export interface Tunnel {
  id: string;
  name: string;
  type: '6to4' | 'ipv6';
  localIp: string;
  remoteIp?: string; // Optional for 6to4
  interfaceName: string;
  status: 'active' | 'inactive' | 'error';
}

export type TunnelCreationData = Omit<Tunnel, 'id' | 'status'>;
export type TunnelUpdateData = Partial<Omit<Tunnel, 'id'>>;
