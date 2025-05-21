'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { deleteTunnelAction } from '@/lib/actions';
import type { Tunnel } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DeleteTunnelDialogProps {
  tunnel: Tunnel;
  children: React.ReactNode; // Trigger element
}

export function DeleteTunnelDialog({ tunnel, children }: DeleteTunnelDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleDelete = async () => {
    startTransition(async () => {
      const result = await deleteTunnelAction(tunnel.id);
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message || 'Tunnel deleted successfully.',
        });
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to delete tunnel.',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Wrap the trigger child with an onClick handler
  const triggerWithHandler = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onClick: () => setOpen(true),
      });
    }
    return child;
  });


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {triggerWithHandler}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this tunnel?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the tunnel
            <span className="font-semibold text-foreground"> "{tunnel.name}"</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
