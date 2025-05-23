
'use server';

import { revalidatePath } from 'next/cache';
import { ubuntuTunnelService } from '@/services/ubuntuTunnelService';
import type { Tunnel, TunnelCreationData, TunnelUpdateData } from '@/types';
import { z } from 'zod';

// Regex for basic IP/CIDR format validation. Doesn't validate IP correctness itself deeply.
const ipWithCidrRegex = /^([0-9]{1,3}\.){3}[0-9]{1,3}\/(0|[1-9]|[12][0-9]|3[0-2])$|^([0-9a-fA-F:]+)\/(0|[1-9]|[1-9][0-9]|1[01][0-9]|12[0-8])$/;


const tunnelSchemaBase = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  type: z.enum(['6to4', 'ipip6', 'gre6'], { required_error: "Tunnel type is required." }),
  localIp: z.string().min(1, "Local IP is required."), // General IP validation, refined below
  remoteIp: z.string().min(1, "Remote IP is required."), // General IP validation, refined below
  assignedIp: z.string().regex(ipWithCidrRegex, { message: "Invalid Assigned IP/CIDR format (e.g., 10.0.0.1/24 or fd00::1/64)." }),
  mtu: z.preprocess(
    (val) => (val === '' || val === undefined || val === null) ? undefined : parseInt(String(val), 10),
    z.number().int().min(68).max(65535).optional()
  ),
  interfaceName: z.string().min(1, "Interface name is required.").regex(/^[a-zA-Z0-9_-]+$/, "Interface name can only contain letters, numbers, underscore, and hyphen."),
});

const tunnelSchema = tunnelSchemaBase.superRefine((data, ctx) => {
  // Validate endpoint IPs based on tunnel type
  if (data.type === '6to4') {
    if (!z.string().ip({ version: "v4", message: "Local IP must be a valid IPv4 address for 6to4 tunnels." }).safeParse(data.localIp).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local IP must be a valid IPv4 address for 6to4 tunnels.", path: ["localIp"] });
    }
    if (!z.string().ip({ version: "v4", message: "Remote IP must be a valid IPv4 address for 6to4 tunnels." }).safeParse(data.remoteIp).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remote IP must be a valid IPv4 address for 6to4 tunnels.", path: ["remoteIp"] });
    }
  } else if (data.type === 'ipip6' || data.type === 'gre6') {
    if (!z.string().ip({ version: "v6", message: "Local IP must be a valid IPv6 address for ipip6/gre6 tunnels." }).safeParse(data.localIp).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Local IP must be a valid IPv6 address for ipip6/gre6 tunnels.", path: ["localIp"] });
    }
    if (!z.string().ip({ version: "v6", message: "Remote IP must be a valid IPv6 address for ipip6/gre6 tunnels." }).safeParse(data.remoteIp).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Remote IP must be a valid IPv6 address for ipip6/gre6 tunnels.", path: ["remoteIp"] });
    }
  }
});


export async function getTunnelsAction(): Promise<Tunnel[]> {
  return ubuntuTunnelService.getTunnels();
}

export async function getTunnelByIdAction(id: string): Promise<Tunnel | undefined> {
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
  
  const data = validatedFields.data as TunnelCreationData;

  try {
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

  const data = validatedFields.data as TunnelUpdateData;

  try {
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
    const success = await ubuntuTunnelService.deleteTunnel(id);
    if (success) {
      revalidatePath('/dashboard');
      return { success: true, message: 'Tunnel deletion process initiated.' };
    }
    return { success: false, message: 'Tunnel not found or failed to delete.' };
  } catch (error) {
    console.error("Delete Tunnel Action Error:", error);
    return { success: false, message: `Error deleting tunnel: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function toggleTunnelStatusAction(id: string, currentStatus: 'active' | 'inactive' | 'error'): Promise<{ success: boolean; message?: string; newStatus?: 'active' | 'inactive' }> {
  if (!id) return { success: false, message: 'Tunnel ID is missing.' };
  
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
