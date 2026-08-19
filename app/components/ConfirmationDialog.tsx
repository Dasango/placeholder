import React from "react";
import { View } from "react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
}: ConfirmationDialogProps) {
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

        <DialogFooter className="flex-row justify-end gap-3 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
              <Text className="text-zinc-700 dark:text-zinc-300">{cancelText}</Text>
            </Button>
          </DialogClose>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onPress={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={
              variant === "destructive"
                ? "bg-red-650 active:bg-red-700"
                : "bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 dark:active:bg-zinc-200"
            }
          >
            <Text
              className={
                variant === "destructive"
                  ? "text-white font-semibold"
                  : "text-white dark:text-zinc-950 font-semibold"
              }
            >
              {confirmText}
            </Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
