'use server';

import { revalidatePath } from 'next/cache';
import { mockDb } from './mock-db';
import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';
import { z } from 'zod';

const tunnelSchemaBase = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  type: z.enum(['6to4', 'ipv6']),
  localIp: z.string().ip({ message: "Invalid Local IP address." }),
  remoteIp: z.string().ip({ message: "Invalid Remote IP address." }).optional().or(z.literal('')),
  interfaceName: z.string().min(1, "Interface name is required."),
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
  return mockDb.getTunnels();
}

export async function getTunnelByIdAction(id: string): Promise<Tunnel | undefined> {
  return mockDb.getTunnelById(id);
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
  
  const data = validatedFields.data as TunnelCreationData;
  if (data.type === '6to4') {
    delete data.remoteIp; // 6to4 doesn't strictly need a pre-configured remote IP in the same way
  }

  try {
    await mockDb.addTunnel(data);
    revalidatePath('/dashboard');
    return { message: 'Tunnel added successfully.', errors: {} };
  } catch (error) {
    return { message: `Error adding tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`, errors: {} };
  }
}

export async function updateTunnelAction(id: string, prevState: any, formData: FormData) {
  if (!id) return { message: 'Tunnel ID is missing.', errors: {} };

  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = tunnelSchema.safeParse(rawData); // Use same schema for update

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to update tunnel due to validation errors.',
    };
  }

  const data = validatedFields.data as TunnelUpdateData;
   if (data.type === '6to4' && data.remoteIp === '') {
    data.remoteIp = undefined; 
  }


  try {
    const updatedTunnel = await mockDb.updateTunnel(id, data);
    if (!updatedTunnel) {
      return { message: 'Tunnel not found.', errors: {} };
    }
    revalidatePath('/dashboard');
    return { message: 'Tunnel updated successfully.', errors: {} };
  } catch (error) {
    return { message: `Error updating tunnel: ${error instanceof Error ? error.message : 'Unknown error'}`, errors: {} };
  }
}

export async function deleteTunnelAction(id: string): Promise<{ success: boolean; message?: string }> {
  if (!id) return { success: false, message: 'Tunnel ID is missing.' };
  try {
    const success = await mockDb.deleteTunnel(id);
    if (success) {
      revalidatePath('/dashboard');
      return { success: true, message: 'Tunnel deleted successfully.' };
    }
    return { success: false, message: 'Tunnel not found or already deleted.' };
  } catch (error) {
    return { success: false, message: `Error deleting tunnel: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
