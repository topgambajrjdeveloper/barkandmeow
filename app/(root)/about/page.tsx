import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PatreonDonationSection } from "@/components/(root)/about/patreon-donation-section"

export const metadata: Metadata = {
  title: "Sobre Nosotros | BarkAndMeow",
  description: "Conoce más sobre BarkAndMeow, nuestra misión y el equipo detrás de esta comunidad para mascotas.",
}

export default function AboutPage() {
  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Sobre BarkAndMeow</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nuestra Historia</h2>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <p className="mb-4">
                BarkAndMeow nació en 2025 de la pasión compartida por un grupo de amantes de los animales que
                identificaron la necesidad de una plataforma dedicada exclusivamente a conectar a dueños de mascotas.
              </p>
              <p>
                Lo que comenzó como un pequeño proyecto entre amigos ha crecido hasta convertirse en una vibrante
                comunidad donde los dueños de mascotas pueden compartir experiencias, encontrar consejos y conectar con
                otros amantes de los animales en su área.
              </p>
            </div>
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Fundadores de BarkAndMeow"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                En BarkAndMeow, nuestra misión es crear un espacio digital seguro y amigable donde los dueños de
                mascotas puedan:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>Compartir momentos especiales con sus mascotas</li>
                <li>Conectar con otros dueños de mascotas en su área</li>
                <li>Acceder a información útil sobre cuidado animal</li>
                <li>Encontrar servicios y productos de calidad para sus compañeros peludos</li>
                <li>Formar parte de una comunidad que celebra el amor por los animales</li>
              </ul>
              <p>
                Creemos que las mascotas enriquecen nuestras vidas de maneras inimaginables, y queremos celebrar ese
                vínculo especial facilitando conexiones significativas entre personas que comparten esta pasión.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nuestros Valores</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Bienestar Animal</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Promovemos prácticas responsables de cuidado animal y apoyamos iniciativas que mejoran la calidad de
                  vida de las mascotas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Comunidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Fomentamos un ambiente inclusivo donde todos los amantes de los animales se sientan bienvenidos y
                  valorados.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Educación</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Compartimos conocimiento sobre cuidado animal para ayudar a los dueños a tomar decisiones informadas
                  sobre sus mascotas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Innovación</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Buscamos constantemente nuevas formas de mejorar la experiencia de nuestra comunidad a través de la
                  tecnología.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Transparencia</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Operamos con honestidad y claridad en todas nuestras interacciones con la comunidad y nuestros
                  colaboradores.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Responsabilidad</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Asumimos el compromiso de crear un espacio seguro y respetuoso para todos los miembros de nuestra
                  comunidad.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Nuestro Equipo</h2>
          <p className="mb-6">
            Detrás de BarkAndMeow hay un equipo diverso de profesionales apasionados por los animales y la tecnología.
            Cada miembro aporta su experiencia única para crear la mejor plataforma posible para nuestra comunidad.
          </p>
          <div className="text-center mb-6">
            <Button asChild>
              <Link href="/team">Conoce a nuestro equipo</Link>
            </Button>
          </div>
        </section>

        {/* Sección de donaciones con Patreon */}
        <Suspense fallback={<div>Cargando opciones de donación...</div>}>
          <PatreonDonationSection />
        </Suspense>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contacto</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4">
                ¿Tienes preguntas, sugerencias o simplemente quieres saludarnos? Nos encantaría saber de ti.
              </p>
              <div className="text-center">
                <Button asChild>
                  <Link href="/contact">Contáctanos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

