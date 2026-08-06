import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Ionicons from "@expo/vector-icons/Ionicons";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegistroForm, schemaRegistro } from "./validation/formvalidador";

export default function Configuracion() {
  const { control, handleSubmit } = useForm<RegistroForm>({
    resolver: zodResolver(schemaRegistro),
    defaultValues: {
      repositoryName: "/",
      email: "",
    },
  });

  const onSubmit = (data: RegistroForm) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <View className="flex-1 bg-gray-500 p-6">
      <Text className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Configuración
      </Text>

      <Controller
        control={control}
        rules={{ required: "El nombre de usuario es obligatorio" }}
        name="repositoryName"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View className="mb-4">
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Nombre de usuario"
              className="bg-white p-3 rounded-md border border-gray-300"
            />
            {!!error && (
              <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
            )}
          </View>
        )}
      />
      <Controller
        control={control}
        rules={{ required: "El correo es obligatorio" }}
        name="email"
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <View className="mb-4">
            <TextInput
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Correo electrónico"
              className="bg-white p-3 rounded-md border border-gray-300"
            />
            {!!error && (
              <Text className="text-red-500 text-sm mt-1">{error.message}</Text>
            )}
          </View>
        )}
      />

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="flex-row items-center justify-center bg-blue-600 p-3 rounded-md"
      >
        <Ionicons name="arrow-forward-circle" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}
