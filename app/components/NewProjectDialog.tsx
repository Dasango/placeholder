import React, { useState } from "react";
import { View, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => void;
}

export function NewProjectDialog({ open, onOpenChange, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Error", "El nombre del cuaderno no puede estar vacío.");
      return;
    }
    onCreate(trimmedName);
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 p-6 rounded-lg max-w-sm w-11/12">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
          className="gap-4"
        >
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-zinc-50 font-bold text-lg">
              Nuevo Cuaderno
            </DialogTitle>
            <DialogDescription className="text-zinc-500 dark:text-zinc-400 text-sm">
              Crea un cuaderno independiente para organizar tus documentos.
            </DialogDescription>
          </DialogHeader>

          <View className="my-2">
            <TextInput
              placeholder="Nombre del cuaderno..."
              placeholderTextColor="#a1a1aa"
              value={name}
              onChangeText={setName}
              className="bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 text-base"
              autoFocus
            />
          </View>

          <DialogFooter className="flex-row justify-end gap-3 mt-2">
            <DialogClose asChild>
              <Button variant="outline" className="border-zinc-200 dark:border-zinc-800">
                <Text className="text-zinc-700 dark:text-zinc-300">Cancelar</Text>
              </Button>
            </DialogClose>
            <Button
              onPress={handleSubmit}
              className="bg-zinc-900 dark:bg-zinc-50 active:bg-zinc-800 dark:active:bg-zinc-200"
            >
              <Text className="text-white dark:text-zinc-950 font-semibold">Crear</Text>
            </Button>
          </DialogFooter>
        </KeyboardAvoidingView>
      </DialogContent>
    </Dialog>
  );
}
