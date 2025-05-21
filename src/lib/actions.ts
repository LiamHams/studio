
'use server';

import { revalidatePath } from 'next/cache';
import { ubuntuTunnelService } from '@/services/ubuntuTunnelService';
import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';
import { z } from 'zod';

const tunnelSchemaBase = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  type: z.enum(['6to4', 'ipv6']),
  localIp: z.string().ip({ message: "Invalid Local IP address." }),
  remoteIp: z.string().ip({ message: "Invalid Remote IP address." }).optional().or(z.literal('')),
  interfaceName: z.string().min(1, "Interface name is required.").regex(/^[a-zA-Z0-9_-]+$/, "Interface name can only contain letters, numbers, underscore, and hyphen."),
});

const tunnelSchema = tunnelSchemaBase.refine(data => {
  if (data.type === 'ipv6' && (!data.remoteIp || data.remoteIp.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "Remote IP is required for IPv6 tunnels.",
  path: ["remoteIp"],
});


export async function getTunnelsAction(): Promise<Tunnel[]> {
  // return mockDb.getTunnels(); // Old
  return ubuntuTunnelService.getTunnels();
}

export async function getTunnelByIdAction(id: string): Promise<Tunnel | undefined> {
  // return mockDb.getTunnelById(id); // Old
  return ubuntuTunnelService.getTunnelById(id);
}

export async function addTunnelAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = tunnelSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to add tunnel due to validation errors.',
    };
  }
  
  let data = validatedFields.data as TunnelCreationData;
  // Ensure remoteIp is undefined if it's an empty string and type is 6to4
  if (data.type === '6to4' && data.remoteIp === '') {
    data = { ...data, remoteIp: undefined };
  }


  try {
    // await mockDb.addTunnel(data); // Old
    await ubuntuTunnelService.addTunnel(data);
    revalidatePath('/dashboard');
    return { message: 'Tunnel added successfully.', errors: {} };
  } catch (error) {
    console.error("Add Tunnel Action Error:", error);
    return { message: `Error adding tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`, errors: {} };
  }
}

export async function updateTunnelAction(id: string, prevState: any, formData: FormData) {
  if (!id) return { message: 'Tunnel ID is missing.', errors: {} };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = tunnelSchema.safeParse(rawData); 

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update tunnel due to validation errors.',
    };
  }

  let data = validatedFields.data as TunnelUpdateData;
   if (data.type === '6to4' && data.remoteIp === '') {
    data = { ...data, remoteIp: undefined };
  }


  try {
    // const updatedTunnel = await mockDb.updateTunnel(id, data); // Old
    const updatedTunnel = await ubuntuTunnelService.updateTunnel(id, data);
    if (!updatedTunnel) {
      return { message: 'Tunnel not found or failed to update.', errors: {} };
    }
    revalidatePath('/dashboard');
    return { message: 'Tunnel updated successfully.', errors: {} };
  } catch (error) {
    console.error("Update Tunnel Action Error:", error);
    return { message: `Error updating tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`, errors: {} };
  }
}

export async function deleteTunnelAction(id: string): Promise<{ success: boolean; message?: string }> {
  if (!id) return { success: false, message: 'Tunnel ID is missing.' };
  try {
    // const success = await mockDb.deleteTunnel(id); // Old
    const success = await ubuntuTunnelService.deleteTunnel(id);
    if (success) {
      revalidatePath('/dashboard');
      return { success: true, message: 'Tunnel deletion process initiated.' }; // Changed message to reflect simulation
    }
    return { success: false, message: 'Tunnel not found or failed to delete.' };
  } catch (error) {
    console.error("Delete Tunnel Action Error:", error);
    return { success: false, message: `Error deleting tunnel: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function toggleTunnelStatusAction(id: string, currentStatus: 'active' | 'inactive' | 'error'): Promise<{ success: boolean; message?: string; newStatus?: 'active' | 'inactive' }> {
  if (!id) return { success: false, message: 'Tunnel ID is missing.' };
  
  // For 'error' status, we might want to try to activate it.
  // Or, if it's active/inactive, we toggle.
  const targetStatus = (currentStatus === 'active') ? 'inactive' : 'active';

  try {
    const success = await ubuntuTunnelService.setTunnelStatus(id, targetStatus);
    if (success) {
      revalidatePath('/dashboard');
      return { success: true, message: `Tunnel status change to ${targetStatus} initiated.`, newStatus: targetStatus };
    }
    return { success: false, message: 'Failed to change tunnel status.' };
  } catch (error) {
    console.error("Toggle Tunnel Status Action Error:", error);
    return { success: false, message: `Error toggling tunnel status: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
