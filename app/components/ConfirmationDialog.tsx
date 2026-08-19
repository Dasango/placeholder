import React from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";
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
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <TouchableWithoutFeedback>
            <View className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-sm gap-4 shadow-xl">
              <View className="gap-1">
                <Text className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">
                  {title}
                </Text>
                <Text className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">
                  {description}
                </Text>
              </View>

              <View className="flex-row justify-end gap-3 mt-4">
                <Button
                  variant="outline"
                  onPress={handleClose}
                  className="border border-zinc-200 dark:border-zinc-800"
                >
                  <Text className="text-zinc-700 dark:text-zinc-300">{cancelText}</Text>
                </Button>
                <Button
                  variant={variant === "destructive" ? "destructive" : "default"}
                  onPress={() => {
                    onConfirm();
                    onOpenChange(false);
                  }}
                  className={
                    variant === "destructive"
                      ? "bg-red-600 active:bg-red-700"
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
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
