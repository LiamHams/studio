
/**
 * @fileOverview Service for managing network tunnels on an Ubuntu system.
 * This service simulates the execution of system commands.
 */
import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';

// Simulate a database or system state for tunnels
let tunnelsState: Tunnel[] = [
  {
    id: '1',
    name: 'Initial Mock IPIP6',
    type: 'ipip6',
    localIp: '2001:db8:a::1', // IPv6
    remoteIp: '2001:db8:a::2', // IPv6
    assignedIp: 'fd00:1::1/64',
    mtu: 1460,
    interfaceName: 'sim-ipip6-0',
    status: 'active',
  },
  {
    id: '2',
    name: 'Initial Mock 6to4',
    type: '6to4',
    localIp: '192.0.2.10', // IPv4
    remoteIp: '198.51.100.1', // IPv4, example public 6to4 relay
    assignedIp: '2002:c000:020a::1/48', // Derived 6to4 prefix + host
    mtu: 1480,
    interfaceName: 'sim-6to4-0',
    status: 'inactive',
  },
];

// Helper to simulate command execution
async function executeSimulatedCommand(command: string, logOnly: boolean = false): Promise<{ success: boolean; message: string }> {
  console.log(`[UbuntuTunnelService] ${logOnly ? 'INFO' : 'WOULD EXECUTE'}: ${command}`);
  if (logOnly) return { success: true, message: `Logged: ${command}`};

  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  if (command.includes("error_test")) {
    return { success: false, message: `Simulated error executing: ${command}` };
  }
  return { success: true, message: `Simulated success for: ${command}` };
}

async function applyNetplanChanges(): Promise<{ success: boolean; message: string }> {
  // In a real system, you might run `sudo netplan apply` or interact with netplan configurations.
  // For simulation, we just log it. It's often not needed for `ip tunnel` commands if they are applied directly.
  // However, persistent configuration would involve netplan or ifupdown.
  return executeSimulatedCommand("sudo netplan apply (simulated, if needed for persistence)", true);
}

function getIpCommand(assignedIp: string): string {
  // Check if assignedIp is IPv6 to use `ip -6`
  // This is a simple check, a robust one would parse the IP properly
  return assignedIp.includes(':') ? 'ip -6' : 'ip';
}

export const ubuntuTunnelService = {
  async getTunnels(): Promise<Tunnel[]> {
    console.log('[UbuntuTunnelService] Fetching tunnels (simulated)');
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
    
    const commands: string[] = [];
    let tunnelCommand = "";

    switch (data.type) {
      case '6to4':
        tunnelCommand = `sudo ip tunnel add ${data.interfaceName} mode sit local ${data.localIp} remote ${data.remoteIp} ttl 64`;
        break;
      case 'ipip6':
        tunnelCommand = `sudo ip -6 tunnel add ${data.interfaceName} mode ipip6 local ${data.localIp} remote ${data.remoteIp} encaplimit none`;
        break;
      case 'gre6':
        tunnelCommand = `sudo ip -6 tunnel add ${data.interfaceName} mode ip6gre local ${data.localIp} remote ${data.remoteIp} encaplimit none`;
        break;
      default:
        throw new Error(`Unsupported tunnel type: ${data.type}`);
    }
    commands.push(tunnelCommand);

    const ipCmd = getIpCommand(data.assignedIp);
    commands.push(`sudo ${ipCmd} addr add ${data.assignedIp} dev ${data.interfaceName}`);

    if (data.mtu) {
      commands.push(`sudo ip link set ${data.interfaceName} mtu ${data.mtu}`);
    }
    commands.push(`sudo ip link set ${data.interfaceName} up`);

    for (const cmd of commands) {
      const result = await executeSimulatedCommand(cmd);
      if (!result.success) {
        // Attempt to clean up if a command fails mid-sequence (e.g., delete tunnel if add failed)
        await executeSimulatedCommand(`sudo ip tunnel del ${data.interfaceName}`, true); // Log cleanup attempt
        throw new Error(`Failed to execute command "${cmd}": ${result.message}`);
      }
    }
    
    // await applyNetplanChanges(); // If managing via netplan for persistence

    const newTunnel: Tunnel = {
      ...data,
      id: Date.now().toString(),
      status: 'active', // New tunnels are active after 'ip link set up'
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

    const oldTunnel = tunnelsState[tunnelIndex];
    
    // Delete old tunnel interface
    const deleteCmd = `sudo ip tunnel del ${oldTunnel.interfaceName}`;
    const deleteResult = await executeSimulatedCommand(deleteCmd);
    // We proceed even if delete fails, as the interface might not exist or another issue.
    if (!deleteResult.success) {
      console.warn(`[UbuntuTunnelService] Could not delete old tunnel ${oldTunnel.interfaceName} during update: ${deleteResult.message}. Proceeding with add.`);
    }

    // Create new tunnel with updated data
    // Merge old data with new data, ensuring all required fields for creation are present
    const creationData: TunnelCreationData = {
      name: data.name || oldTunnel.name,
      type: data.type || oldTunnel.type,
      localIp: data.localIp || oldTunnel.localIp,
      remoteIp: data.remoteIp || oldTunnel.remoteIp,
      assignedIp: data.assignedIp || oldTunnel.assignedIp,
      mtu: data.mtu === undefined ? oldTunnel.mtu : data.mtu, // Handle explicit undefined for removal or take new/old
      interfaceName: data.interfaceName || oldTunnel.interfaceName, // Usually interface name shouldn't change, but if it does...
    };

    // If interface name changes, ensure old one is targeted for delete.
    // If interface name doesn't change, the previous delete was correct.
    // If it *did* change, the `deleteCmd` above used the *old* interface name, which is correct.

    const commands: string[] = [];
    let tunnelCommand = "";

    switch (creationData.type) {
      case '6to4':
        tunnelCommand = `sudo ip tunnel add ${creationData.interfaceName} mode sit local ${creationData.localIp} remote ${creationData.remoteIp} ttl 64`;
        break;
      case 'ipip6':
        tunnelCommand = `sudo ip -6 tunnel add ${creationData.interfaceName} mode ipip6 local ${creationData.localIp} remote ${creationData.remoteIp} encaplimit none`;
        break;
      case 'gre6':
        tunnelCommand = `sudo ip -6 tunnel add ${creationData.interfaceName} mode ip6gre local ${creationData.localIp} remote ${creationData.remoteIp} encaplimit none`;
        break;
      default:
        throw new Error(`Unsupported tunnel type: ${creationData.type}`);
    }
    commands.push(tunnelCommand);

    const ipCmd = getIpCommand(creationData.assignedIp);
    commands.push(`sudo ${ipCmd} addr add ${creationData.assignedIp} dev ${creationData.interfaceName}`);
    
    if (creationData.mtu) {
      commands.push(`sudo ip link set ${creationData.interfaceName} mtu ${creationData.mtu}`);
    }
    // Re-apply the 'up' state based on the old tunnel's status, or default to 'up' if status was part of update.
    const desiredLinkState = oldTunnel.status === 'active' ? 'up' : 'down';
    commands.push(`sudo ip link set ${creationData.interfaceName} ${desiredLinkState}`);


    for (const cmd of commands) {
      const result = await executeSimulatedCommand(cmd);
      if (!result.success) {
        throw new Error(`Failed to execute command "${cmd}" during update: ${result.message}`);
      }
    }

    // await applyNetplanChanges();

    tunnelsState[tunnelIndex] = { 
        ...oldTunnel, // keep original ID and potentially status (if not re-upping)
        ...creationData, // apply all validated and merged data
        status: oldTunnel.status, // Preserve original status unless explicitly changed by setTunnelStatus
                                 // Or, if 'up' command implies active, then 'active'
    };
     if (commands.some(cmd => cmd.includes(`ip link set ${creationData.interfaceName} up`))) {
        tunnelsState[tunnelIndex].status = 'active';
    } else if (commands.some(cmd => cmd.includes(`ip link set ${creationData.interfaceName} down`))) {
        tunnelsState[tunnelIndex].status = 'inactive';
    }


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
    const command = `sudo ip tunnel del ${tunnelToDelete.interfaceName}`;
    
    const result = await executeSimulatedCommand(command);
    // await applyNetplanChanges(); // If managing via netplan for persistence

    if (!result.success) {
      // Log error but still remove from mock state for simulation consistency.
      console.error(`[UbuntuTunnelService] Failed to execute delete command for tunnel ${id}: ${result.message}. Removing from state anyway.`);
    }

    tunnelsState = tunnelsState.filter(t => t.id !== id);
    console.log(`[UbuntuTunnelService] Tunnel ${id} removed from simulated state.`);
    return true; // Return true if found and attempt was made, even if OS command failed in sim
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

    const result = await executeSimulatedCommand(command);
    if (!result.success) {
      // Should we set status to 'error' here? Or let it throw?
      // For now, let it throw so the action can report a detailed error.
      throw new Error(`Failed to set tunnel status for ${tunnel.interfaceName}: ${result.message}`);
    }
    // await applyNetplanChanges(); // If needed

    tunnel.status = status;
    console.log(`[UbuntuTunnelService] Tunnel ${id} status updated to ${status} in simulated state.`);
    return true;
  }
};
