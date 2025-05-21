import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';

let tunnels: Tunnel[] = [
  { 
    id: '1', 
    name: 'Main Office IPv6', 
    type: 'ipv6', 
    localIp: '2001:db8:abcd:0001::1', 
    remoteIp: '2001:db8:abcd:0002::1', 
    interfaceName: 'he-ipv6', 
    status: 'active' 
  },
  { 
    id: '2', 
    name: 'Branch Office 6to4', 
    type: '6to4', 
    localIp: '192.0.2.10', 
    interfaceName: 'sit1', 
    status: 'inactive' 
  },
  { 
    id: '3', 
    name: 'Development Server IPv6', 
    type: 'ipv6', 
    localIp: '2001:db8:efgh:0003::1', 
    remoteIp: '2001:db8:efgh:0004::1', 
    interfaceName: 'tun0', 
    status: 'error' 
  },
];

export const mockDb = {
  getTunnels: async (): Promise<Tunnel[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    return JSON.parse(JSON.stringify(tunnels));
  },
  getTunnelById: async (id: string): Promise<Tunnel | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return JSON.parse(JSON.stringify(tunnels.find(t => t.id === id)));
  },
  addTunnel: async (data: TunnelCreationData): Promise<Tunnel> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newTunnel: Tunnel = {
      ...data,
      id: Date.now().toString(), // Simple ID generation
      status: 'inactive', // Default status for new tunnels
    };
    tunnels.push(newTunnel);
    return JSON.parse(JSON.stringify(newTunnel));
  },
  updateTunnel: async (id: string, data: TunnelUpdateData): Promise<Tunnel | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const tunnelIndex = tunnels.findIndex(t => t.id === id);
    if (tunnelIndex === -1) {
      return null;
    }
    tunnels[tunnelIndex] = { ...tunnels[tunnelIndex], ...data };
    return JSON.parse(JSON.stringify(tunnels[tunnelIndex]));
  },
  deleteTunnel: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLength = tunnels.length;
    tunnels = tunnels.filter(t => t.id !== id);
    return tunnels.length < initialLength;
  },
};
