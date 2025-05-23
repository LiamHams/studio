export interface Tunnel {
  id: string;
  name: string;
  type: '6to4' | 'ipip6' | 'gre6'; // Updated tunnel types
  localIp: string; // Endpoint IP
  remoteIp: string; // Endpoint IP, now always required
  assignedIp: string; // IP address/CIDR for the tunnel interface (e.g., "172.20.60.1/30" or "fd03::1/126")
  mtu?: number; // Optional MTU for the tunnel interface
  interfaceName: string;
  status: 'active' | 'inactive' | 'error';
}

export type TunnelCreationData = Omit<Tunnel, 'id' | 'status'>;
export type TunnelUpdateData = Partial<Omit<Tunnel, 'id' | 'status'>>; // status should not be directly updatable via form
