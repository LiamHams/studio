
'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Edit3 } from 'lucide-react';
import { updateTunnelAction } from '@/lib/actions';
import type { Tunnel } from '@/types';
import { TunnelFormFields } from './TunnelFormFields';
import { useToast } from '@/hooks/use-toast';

interface EditTunnelDialogProps {
  tunnel: Tunnel;
  children: React.ReactNode; // Trigger element
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Saving Changes...' : 'Save Changes'}
    </Button>
  );
}

export function EditTunnelDialog({ tunnel, children }: EditTunnelDialogProps) {
  const [open, setOpen] = React.useState(false);
  const updateTunnelActionWithId = updateTunnelAction.bind(null, tunnel.id);
  const [state, formAction] = useActionState(updateTunnelActionWithId, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message) {
       if (Object.keys(state.errors).length === 0 && state.message.includes('successfully')) {
        toast({
          title: "Success",
          description: state.message,
        });
        setOpen(false);
      } else if (Object.keys(state.errors).length > 0) {
         toast({
          title: "Validation Error",
          description: state.message,
          variant: "destructive",
        });
      } else if (state.message && !state.message.includes('successfully')) {
         toast({
          title: "Error",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Consider resetting form state or errors when dialog closes without saving
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {React.cloneElement(children as React.ReactElement, { onClick: () => setOpen(true) })}
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Tunnel: {tunnel.name}</DialogTitle>
          <DialogDescription>
            Modify the tunnel details below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4 py-2">
          <TunnelFormFields defaultValues={tunnel} errors={state.errors} />
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
