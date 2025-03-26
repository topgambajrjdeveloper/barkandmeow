"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Twitter, Instagram, Linkedin, Github } from "lucide-react"

interface SocialMedia {
  twitter?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  github?: string
}

interface TeamMemberProps {
  member: {
    id: string
    name: string
    role: string
    bio: string
    image: string
    socialMedia: SocialMedia
  }
}

export function TeamMember({ member }: TeamMemberProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative w-full h-48">
        <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{member.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">{member.role}</p>
        <p className="text-sm mb-4">{member.bio}</p>
        <div className="flex space-x-2">
          {member.socialMedia.twitter && (
            <Link href={member.socialMedia.twitter} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {member.socialMedia.instagram && (
            <Link href={member.socialMedia.instagram} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {member.socialMedia.linkedin && (
            <Link href={member.socialMedia.linkedin} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </Button>
            </Link>
          )}
          {member.socialMedia.github && (
            <Link href={member.socialMedia.github} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="GitHub">
                <Github className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

