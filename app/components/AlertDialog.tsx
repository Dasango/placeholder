import React from "react";
import { View, Modal, TouchableWithoutFeedback } from "react-native";
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
  buttonText = "Got it",
}: AlertDialogProps) {
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

              <View className="flex-row justify-end mt-4">
                <Button
                  onPress={handleClose}
                  className="bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 dark:active:bg-zinc-200"
                >
                  <Text className="text-white dark:text-zinc-950 font-semibold">{buttonText}</Text>
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
