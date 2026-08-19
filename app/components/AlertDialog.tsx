import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  buttonText?: string;
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  buttonText = "Entendido",
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 rounded-lg max-w-sm w-11/12">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">
            {title}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end mt-4">
          <DialogClose asChild>
            <Button className="bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 dark:active:bg-zinc-200">
              <Text className="text-white dark:text-zinc-950 font-semibold">{buttonText}</Text>
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
