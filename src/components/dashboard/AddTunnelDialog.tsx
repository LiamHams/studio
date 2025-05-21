'use client';

import * as React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { PlusCircle } from 'lucide-react';
import { addTunnelAction } from '@/lib/actions';
import { TunnelFormFields } from './TunnelFormFields';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? 'Adding Tunnel...' : 'Add Tunnel'}
    </Button>
  );
}

export function AddTunnelDialog() {
  const [open, setOpen] = React.useState(false);
  const [state, formAction] = useFormState(addTunnelAction, { message: '', errors: {} });
  const { toast } = useToast();
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.message) {
      if (Object.keys(state.errors).length === 0 && state.message.includes('successfully')) {
        toast({
          title: "Success",
          description: state.message,
        });
        setOpen(false); // Close dialog on success
        formRef.current?.reset(); // Reset form
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
      // Reset form state when dialog is closed
      formRef.current?.reset();
       // Manually clear server-side error state if needed, or use a new key for the form
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Tunnel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Tunnel</DialogTitle>
          <DialogDescription>
            Enter the details for the new tunnel. Click add when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} ref={formRef} className="space-y-4 py-2">
          <TunnelFormFields errors={state.errors} />
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
