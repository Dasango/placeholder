import React from "react";
import { ScrollView, View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { Check, LoaderCircle, Plus, Sparkles, Star, Trash2 } from "lucide-react-native";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-3">
      <Text className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
        {title}
      </Text>
      {children}
    </View>
  );
}

export function UIGallery() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="gap-10 p-6"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text variant="h3">Galería de UI</Text>
        <Text variant="muted">
          Todos los componentes del sistema de diseño en un solo lugar.
        </Text>
      </View>

      {/* Typography */}
      <Section title="Tipografía">
        <View className="gap-2">
          <Text variant="h1">Encabezado H1</Text>
          <Text variant="h2">Encabezado H2</Text>
          <Text variant="h3">Encabezado H3</Text>
          <Text variant="h4">Encabezado H4</Text>
          <Text variant="p">
            Párrafo estándar para contenido descriptivo dentro de la app.
          </Text>
          <Text variant="lead">Lead: texto destacado de gran tamaño.</Text>
          <Text variant="large">Large: texto de tamaño grande.</Text>
          <Text variant="small">Small: texto pequeño y compacto.</Text>
          <Text variant="muted">Muted: texto atenuado y secundario.</Text>
          <Text variant="blockquote">
            Blockquote: una cita relevante dentro del contenido.
          </Text>
          <Text variant="code">const app = expo;</Text>
        </View>
      </Section>

      {/* Buttons */}
      <Section title="Botones — Variantes">
        <View className="flex-row flex-wrap gap-3">
          <Button>
            <Text>Default</Text>
          </Button>
          <Button variant="secondary">
            <Text>Secondary</Text>
          </Button>
          <Button variant="destructive">
            <Text>Destructive</Text>
          </Button>
          <Button variant="outline">
            <Text>Outline</Text>
          </Button>
          <Button variant="ghost">
            <Text>Ghost</Text>
          </Button>
          <Button variant="link">
            <Text>Link</Text>
          </Button>
        </View>
      </Section>

      <Section title="Botones — Tamaños">
        <View className="flex-row flex-wrap items-center gap-3">
          <Button size="sm">
            <Text>Small</Text>
          </Button>
          <Button>
            <Text>Default</Text>
          </Button>
          <Button size="lg">
            <Text>Large</Text>
          </Button>
          <Button size="icon" aria-label="Agregar">
            <Icon as={Plus} />
          </Button>
          <Button variant="outline" size="sm">
            <Icon as={Check} />
            <Text>Con icono</Text>
          </Button>
        </View>
      </Section>

      <Section title="Botones — Estados">
        <View className="flex-row flex-wrap gap-3">
          <Button disabled>
            <Text>Deshabilitado</Text>
          </Button>
          <Button variant="secondary" disabled>
            <LoaderCircle className="size-4 animate-spin" />
            <Text>Cargando</Text>
          </Button>
        </View>
      </Section>

      {/* Cards */}
      <Section title="Tarjetas">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>
              Descripción breve de la tarjeta para dar contexto al contenido.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text variant="small">
              Contenido de la tarjeta. Aquí puede ir cualquier vista o
              componente adicional.
            </Text>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" size="sm">
              <Text>Cancelar</Text>
            </Button>
            <Button size="sm">
              <Text>Guardar</Text>
            </Button>
          </CardFooter>
        </Card>
      </Section>

      {/* Progress */}
      <Section title="Progreso">
        <View className="gap-3">
          <Progress value={40} />
          <Progress value={75} />
          <Progress value={100} />
        </View>
      </Section>

      {/* Skeletons */}
      <Section title="Skeletons">
        <View className="gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </View>
      </Section>

      {/* Dialog */}
      <Section title="Diálogo">
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Text>Abrir diálogo</Text>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Confirmas la acción?</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. Revisa los detalles antes de
                continuar.
              </DialogDescription>
            </DialogHeader>
            <View className="flex-row items-center gap-2 rounded-md bg-muted p-3">
              <Icon as={Star} className="text-foreground size-4" />
              <Text variant="small">Información adicional del diálogo.</Text>
            </View>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  <Text>Cancelar</Text>
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="destructive">
                  <Trash2 className="size-4 text-white" />
                  <Text>Eliminar</Text>
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      {/* Icons */}
      <Section title="Iconos">
        <View className="flex-row flex-wrap gap-4">
          <Icon as={Check} className="text-primary size-6" />
          <Icon as={Plus} className="text-primary size-6" />
          <Icon as={Star} className="text-primary size-6" />
          <Icon as={Sparkles} className="text-indigo-400 size-6" />
          <Icon as={Trash2} className="text-red-400 size-6" />
          <Icon as={LoaderCircle} className="text-primary size-6" />
        </View>
      </Section>
    </ScrollView>
  );
}