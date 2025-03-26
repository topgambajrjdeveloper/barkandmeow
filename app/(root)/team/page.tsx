import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Github, Instagram, Linkedin, Twitter, Crown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import prisma from "@/lib/prismadb"

export const metadata: Metadata = {
  title: "Nuestro Equipo | BarkAndMeow",
  description: "Conoce al equipo detrás de BarkAndMeow, profesionales apasionados por los animales y la tecnología.",
}

async function getTeamMembers() {
  try {
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: {
        order: "asc",
      },
    })

    return teamMembers
  } catch (error) {
    console.error("Error al obtener miembros del equipo:", error)
    return []
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers()

  if (!teamMembers.length) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">Nuestro Equipo</h1>
        <p className="text-muted-foreground">Estamos construyendo nuestro equipo. ¡Vuelve pronto para conocernos!</p>
      </div>
    )
  }

  // Separar fundadores del resto del equipo
  const founders = teamMembers.filter((member) => member.isFounder)
  const regularMembers = teamMembers.filter((member) => !member.isFounder)

  // Verificar si hay un solo fundador
  const singleFounder = founders.length === 1

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nuestro Equipo</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Detrás de BarkAndMeow hay un equipo diverso de profesionales apasionados por los animales y la tecnología.
            Cada miembro aporta su experiencia única para crear la mejor plataforma posible para nuestra comunidad.
          </p>
        </header>

        {founders.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-semibold mb-8 flex items-center justify-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              <span>Fundador{founders.length > 1 ? "es" : ""}</span>
            </h2>

            {singleFounder ? (
              // Diseño para un solo fundador
              <SingleFounderCard founder={founders[0]} />
            ) : (
              // Diseño para múltiples fundadores
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {founders.map((member) => (
                  <TeamMemberCard key={member.id} member={member} isFounder={true} />
                ))}
              </div>
            )}
          </section>
        )}

        {regularMembers.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-8 text-center">{founders.length > 0 ? "Nuestro Equipo" : ""}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Componente para mostrar un solo fundador de manera destacada
function SingleFounderCard({ founder }: { founder: any }) {
  const hasSocialMedia = founder.twitter || founder.instagram || founder.facebook || founder.linkedin || founder.github

  return (
    <Card className="overflow-hidden mb-12">
      <div className="grid md:grid-cols-2 gap-0">
        <div className="relative aspect-square md:aspect-auto md:h-full overflow-hidden bg-muted">
          {founder.image ? (
            <Image src={founder.image || "/placeholder.svg"} alt={founder.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-6xl font-bold text-primary/40">{founder.name.charAt(0)}</span>
            </div>
          )}

          <div className="absolute top-4 left-4 bg-yellow-500 text-white text-sm font-medium px-3 py-1 rounded-full flex items-center">
            <Crown className="h-4 w-4 mr-1" />
            Fundador
          </div>
        </div>

        <CardContent className="p-8 flex flex-col">
          <h3 className="text-3xl font-bold mb-2">{founder.name}</h3>
          <p className="text-lg text-primary mb-6">{founder.role}</p>

          <div className="text-muted-foreground mb-8 flex-1">
            <p className="text-lg leading-relaxed">{founder.bio}</p>
          </div>

          {hasSocialMedia && (
            <div className="flex gap-4 mt-auto">
              {founder.twitter && (
                <Link
                  href={founder.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Twitter de ${founder.name}`}
                >
                  <Twitter className="h-6 w-6" />
                </Link>
              )}

              {founder.instagram && (
                <Link
                  href={founder.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Instagram de ${founder.name}`}
                >
                  <Instagram className="h-6 w-6" />
                </Link>
              )}

              {founder.facebook && (
                <Link
                  href={founder.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Facebook de ${founder.name}`}
                >
                  <Facebook className="h-6 w-6" />
                </Link>
              )}

              {founder.linkedin && (
                <Link
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`LinkedIn de ${founder.name}`}
                >
                  <Linkedin className="h-6 w-6" />
                </Link>
              )}

              {founder.github && (
                <Link
                  href={founder.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`GitHub de ${founder.name}`}
                >
                  <Github className="h-6 w-6" />
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  )
}

interface TeamMemberCardProps {
  member: any
  isFounder?: boolean
}

function TeamMemberCard({ member, isFounder = false }: TeamMemberCardProps) {
  const hasSocialMedia = member.twitter || member.instagram || member.facebook || member.linkedin || member.github

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {member.image ? (
          <Image
            src={member.image || "/placeholder.svg"}
            alt={member.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-4xl font-bold text-primary/40">{member.name.charAt(0)}</span>
          </div>
        )}

        {isFounder && (
          <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center">
            <Crown className="h-3 w-3 mr-1" />
            Fundador
          </div>
        )}
      </div>

      <CardContent className="flex-1 flex flex-col p-6">
        <h3 className="text-xl font-bold">{member.name}</h3>
        <p className="text-sm text-primary mb-3">{member.role}</p>

        <div className="text-sm text-muted-foreground mb-4 flex-1">
          <p>{member.bio}</p>
        </div>

        {hasSocialMedia && (
          <div className="flex gap-3 mt-auto">
            {member.twitter && (
              <Link
                href={member.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Twitter de ${member.name}`}
              >
                <Twitter className="h-5 w-5" />
              </Link>
            )}

            {member.instagram && (
              <Link
                href={member.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Instagram de ${member.name}`}
              >
                <Instagram className="h-5 w-5" />
              </Link>
            )}

            {member.facebook && (
              <Link
                href={member.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`Facebook de ${member.name}`}
              >
                <Facebook className="h-5 w-5" />
              </Link>
            )}

            {member.linkedin && (
              <Link
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`LinkedIn de ${member.name}`}
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            )}

            {member.github && (
              <Link
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={`GitHub de ${member.name}`}
              >
                <Github className="h-5 w-5" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

