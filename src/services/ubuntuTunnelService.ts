
/**
 * @fileOverview Service for managing network tunnels on an Ubuntu system.
 * This service simulates the execution of system commands.
 * In a real application, this is where you'd use child_process.exec
 * or a similar mechanism to interact with the OS, with extreme care for security.
 */
import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';

// Simulate a database or system state for tunnels
let tunnelsState: Tunnel[] = [
  {
    id: '1',
    name: 'Initial Mock IPv6',
    type: 'ipv6',
    localIp: '2001:db8:abcd:0001::1',
    remoteIp: '2001:db8:abcd:0002::1',
    interfaceName: 'sim-ipv6-0',
    status: 'active',
  },
  {
    id: '2',
    name: 'Initial Mock 6to4',
    type: '6to4',
    localIp: '192.0.2.10',
    interfaceName: 'sim-6to4-0',
    status: 'inactive',
  },
];

// Helper to simulate command execution
async function executeSimulatedCommand(command: string): Promise<{ success: boolean; message: string }> {
  console.log(`[UbuntuTunnelService] WOULD EXECUTE: ${command}`);
  // Simulate some delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  // Simulate potential failure
  if (command.includes("error_test")) {
    return { success: false, message: `Simulated error executing: ${command}` };
  }
  return { success: true, message: `Simulated success for: ${command}` };
}

export const ubuntuTunnelService = {
  async getTunnels(): Promise<Tunnel[]> {
    console.log('[UbuntuTunnelService] Fetching tunnels (simulated)');
    // In a real scenario, this would parse 'ip tunnel show', netplan configs, etc.
    await new Promise(resolve => setTimeout(resolve, 50));
    return JSON.parse(JSON.stringify(tunnelsState));
  },

  async getTunnelById(id: string): Promise<Tunnel | undefined> {
    console.log(`[UbuntuTunnelService] Fetching tunnel by ID: ${id} (simulated)`);
    await new Promise(resolve => setTimeout(resolve, 50));
    return JSON.parse(JSON.stringify(tunnelsState.find(t => t.id === id)));
  },

  async addTunnel(data: TunnelCreationData): Promise<Tunnel> {
    console.log('[UbuntuTunnelService] Adding new tunnel (simulated):', data);
    // Example: Formulate netplan config or ip tunnel commands
    let command = "";
    if (data.type === '6to4') {
      command = `sudo ip tunnel add ${data.interfaceName} mode sit local ${data.localIp} ttl 64`;
      // Plus ip addr add, ip link set up, ip route add...
    } else if (data.type === 'ipv6') {
      command = `sudo ip tunnel add ${data.interfaceName} mode ip6tnl local ${data.localIp} remote ${data.remoteIp} encaplimit none`;
      // Plus ip addr add, ip link set up, ip route add...
    }
    const result = await executeSimulatedCommand(`${command} && sudo netplan apply`);
    if (!result.success) {
      throw new Error(`Failed to add tunnel: ${result.message}`);
    }

    const newTunnel: Tunnel = {
      ...data,
      id: Date.now().toString(),
      status: 'inactive', // New tunnels are inactive until explicitly activated
    };
    tunnelsState.push(newTunnel);
    console.log(`[UbuntuTunnelService] Tunnel ${newTunnel.id} added to simulated state.`);
    return JSON.parse(JSON.stringify(newTunnel));
  },

  async updateTunnel(id: string, data: TunnelUpdateData): Promise<Tunnel | null> {
    console.log(`[UbuntuTunnelService] Updating tunnel ${id} (simulated):`, data);
    const tunnelIndex = tunnelsState.findIndex(t => t.id === id);
    if (tunnelIndex === -1) {
      console.error(`[UbuntuTunnelService] Tunnel ${id} not found for update.`);
      return null;
    }

    // Simulate removing old config and adding new one
    const oldTunnel = tunnelsState[tunnelIndex];
    const removeCommand = `sudo ip tunnel del ${oldTunnel.interfaceName}`;
    await executeSimulatedCommand(removeCommand);

    let addCommand = "";
    const updatedData = { ...oldTunnel, ...data };
    if (updatedData.type === '6to4') {
      addCommand = `sudo ip tunnel add ${updatedData.interfaceName} mode sit local ${updatedData.localIp} ttl 64`;
    } else if (updatedData.type === 'ipv6') {
      addCommand = `sudo ip tunnel add ${updatedData.interfaceName} mode ip6tnl local ${updatedData.localIp} remote ${updatedData.remoteIp} encaplimit none`;
    }
    
    const result = await executeSimulatedCommand(`${addCommand} && sudo netplan apply`);
    if (!result.success) {
      throw new Error(`Failed to update tunnel: ${result.message}`);
    }
    
    tunnelsState[tunnelIndex] = { ...tunnelsState[tunnelIndex], ...data, status: tunnelsState[tunnelIndex].status }; // Keep existing status or update explicitly
    console.log(`[UbuntuTunnelService] Tunnel ${id} updated in simulated state.`);
    return JSON.parse(JSON.stringify(tunnelsState[tunnelIndex]));
  },

  async deleteTunnel(id: string): Promise<boolean> {
    console.log(`[UbuntuTunnelService] Deleting tunnel ${id} (simulated)`);
    const tunnelIndex = tunnelsState.findIndex(t => t.id === id);
    if (tunnelIndex === -1) {
      console.error(`[UbuntuTunnelService] Tunnel ${id} not found for deletion.`);
      return false;
    }
    const tunnelToDelete = tunnelsState[tunnelIndex];
    const command = `sudo ip tunnel del ${tunnelToDelete.interfaceName} && sudo netplan apply`;
    
    const result = await executeSimulatedCommand(command);
    if (!result.success) {
      // Decide if this should throw or return false based on desired behavior
      console.error(`[UbuntuTunnelService] Failed to execute delete command for tunnel ${id}: ${result.message}`);
      // Even if command fails, we remove from our mock state for simulation
    }

    tunnelsState = tunnelsState.filter(t => t.id !== id);
    console.log(`[UbuntuTunnelService] Tunnel ${id} removed from simulated state.`);
    return true;
  },

  async setTunnelStatus(id: string, status: 'active' | 'inactive'): Promise<boolean> {
    console.log(`[UbuntuTunnelService] Setting tunnel ${id} status to ${status} (simulated)`);
    const tunnel = tunnelsState.find(t => t.id === id);
    if (!tunnel) {
      console.error(`[UbuntuTunnelService] Tunnel ${id} not found for status change.`);
      return false;
    }
    const command = status === 'active' 
      ? `sudo ip link set dev ${tunnel.interfaceName} up` 
      : `sudo ip link set dev ${tunnel.interfaceName} down`;

    const result = await executeSimulatedCommand(`${command} && sudo netplan apply`);
    if (!result.success) {
      throw new Error(`Failed to set tunnel status: ${result.message}`);
    }

    tunnel.status = status;
    console.log(`[UbuntuTunnelService] Tunnel ${id} status updated to ${status} in simulated state.`);
    return true;
  }
};
