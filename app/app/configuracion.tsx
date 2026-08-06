import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { configSchema, ConfigFormData } from "./validation/configSchema";

interface FieldProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}

function Field({
  label,
  value,
  error,
  onChange,
  placeholder,
  secureTextEntry = false,
}: FieldProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-400 mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#6e7681"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        autoCorrect={false}
        className={`rounded-xl px-4 py-3 text-white ${
          error ? "border-2 border-red-500" : "border border-gray-800"
        }`}
        style={{ backgroundColor: "#21262d", color: "#ffffff" }}
      />
      {!!error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

export default function Configuracion() {
  const { control, handleSubmit } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      repositoryName: "",
      email: "",
      isPrivate: false,
      token: "",
    },
  });

  const onSubmit = (data: ConfigFormData) => {
    console.log("Datos del formulario:", data);
  };

  return (
    <ScrollView className="flex-1 bg-[#0d1117] p-6 pt-16">
      <Text className="text-2xl font-bold text-white mb-6">Configuración</Text>

      <View className="rounded-2xl border border-gray-800 p-5">
        <Text className="text-lg font-semibold text-white mb-4">
          Repositorio de GitHub
        </Text>

        <Controller
          control={control}
          name="repositoryName"
          render={({ field, fieldState }) => (
            <Field
              label="Repository Name"
              value={field.value}
              onChange={field.onChange}
              placeholder="propietario/repositorio"
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field
              label="Email Alertas"
              value={field.value}
              onChange={field.onChange}
              placeholder="correo@ejemplo.com"
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="flex-row items-center justify-between py-2 mb-4">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-semibold text-white">
              Repositorio Privado
            </Text>
            <Text className="text-xs text-gray-400 mt-0.5">
              Requiere un token de acceso personal
            </Text>
          </View>
          <Controller
            control={control}
            name="isPrivate"
            render={({ field }) => (
              <Switch
                value={field.value}
                onValueChange={field.onChange}
                trackColor={{ false: "#30363d", true: "#10b981" }}
                thumbColor="#ffffff"
              />
            )}
          />
        </View>

        <Controller
          control={control}
          name="token"
          render={({ field, fieldState }) => (
            <Field
              label="Personal Access Token"
              value={field.value}
              onChange={field.onChange}
              placeholder="ghp_..."
              secureTextEntry
              error={fieldState.error?.message}
            />
          )}
        />

        <View className="flex-row mt-2">
          <Text className="text-xs text-gray-400 mr-1">
            Formato: propietario/repositorio · El email es opcional · Los tokens
            clásicos de GitHub tienen 40 caracteres.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="flex-row items-center justify-center bg-emerald-500 p-3 rounded-xl mt-5"
        >
          <Ionicons name="arrow-forward-circle" size={24} color="black" />
          <Text className="text-black font-bold ml-2">Guardar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
