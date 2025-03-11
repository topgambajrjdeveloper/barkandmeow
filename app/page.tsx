import Link from "next/link";
import { Users, Heart, ArrowRight, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/auth";
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  // Si el usuario está autenticado, redirigir al feed
  if (session) {
    redirect("/feed")
  }
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container px-4 mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-up">
            Conecta con la Comunidad de Mascotas
          </h1>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto animate-fade-up delay-150">
            Conecta con otros amantes de las mascotas, comparte experiencias y
            descubre servicios para tus compañeros peludos.
          </p>
          <div className="flex gap-4 justify-center animate-fade-up delay-300">
            <Link href="/explore">
              <Button size="lg">
                Explorar <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Todo lo que tu mascota necesita
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Heart className="h-8 w-8 text-primary" />}
              title="Cartilla Digital"
              description="Mantén el historial médico de tu mascota organizado y accesible."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Comunidad"
              description="Conecta con otros dueños de mascotas y comparte experiencias."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-primary" />}
              title="Eventos"
              description="Encuentra y organiza quedadas con otras mascotas cercanas."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Pasaporte"
              description="Gestiona los documentos oficiales de tu mascota fácilmente."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center p-6">
      <CardContent className="pt-6">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
