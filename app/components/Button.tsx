import React from "react";
import { TouchableOpacity, Text } from "react-native";

export type ButtonStyleType = "dark" | "light" | "line";

interface ButtonProps {
  titulo: string;
  style?: ButtonStyleType;
  onPress: () => void;
}

const styles: Record<ButtonStyleType, { container: string; text: string }> = {
  dark: {
    container: "bg-gray-900 p-3 rounded-lg border-2 border-transparent",
    text: "text-white font-bold",
  },
  light: {
    container: "bg-emerald-500 p-3 rounded-lg border-2 border-transparent",
    text: "text-black font-bold",
  },
  line: {
    container: "border-2 border-emerald-500 p-3 rounded-lg bg-transparent",
    text: "text-emerald-500 font-bold",
  },
};

export function Button({ titulo, style = "dark", onPress }: ButtonProps) {
  const current = styles[style];

  return (
    <TouchableOpacity className={current.container} onPress={onPress}>
      <Text className={current.text}>{titulo}</Text>
    </TouchableOpacity>
  );
}
