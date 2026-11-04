import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventTitle: string;
  onConfirm: () => void;
  isDeleting?: boolean;
  registrationCount?: number;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  eventTitle,
  onConfirm,
  isDeleting = false,
  registrationCount = 0,
}: DeleteEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Event</DialogTitle>
          <DialogDescription>
            {registrationCount > 0
              ? `This event has ${registrationCount} registration${registrationCount === 1 ? "" : "s"} and cannot be permanently deleted. You can cancel it instead.`
              : `Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting || registrationCount > 0}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
