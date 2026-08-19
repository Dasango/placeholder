import React, { useState } from "react";
import { View, TextInput, Modal, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}

export function NewProjectDialog({ open, onOpenChange, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(true);
      return;
    }
    onCreate(trimmedName);
    setName("");
    setError(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setName("");
    setError(false);
    onOpenChange(false);
  };

  return (
    <Modal
      visible={open}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center items-center bg-black/60 px-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-sm gap-4 shadow-xl"
          >
            <View className="gap-1">
              <Text className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">
                New Notebook
              </Text>
              <Text className="text-zinc-500 dark:text-zinc-400 text-sm">
                Create an independent notebook to organize your documents.
              </Text>
            </View>

            <View className="my-1">
              <TextInput
                placeholder="Notebook name..."
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (error && text.trim()) setError(false);
                }}
                className={`bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border rounded-lg p-3 text-base ${
                  error ? "border-red-500" : "border-zinc-200 dark:border-zinc-800"
                }`}
                autoFocus
              />
              {error && (
                <Text className="text-red-500 text-xs mt-1 pl-1 font-medium">
                  The notebook name is required.
                </Text>
              )}
            </View>

            <View className="flex-row justify-end gap-3 mt-1">
              <Button
                variant="outline"
                onPress={handleClose}
                className="border border-zinc-200 dark:border-zinc-800"
              >
                <Text className="text-zinc-700 dark:text-zinc-300">Cancel</Text>
              </Button>
              <Button
                onPress={handleSubmit}
                className="bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 dark:active:bg-zinc-200"
              >
                <Text className="text-white dark:text-zinc-950 font-semibold">Create</Text>
              </Button>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
