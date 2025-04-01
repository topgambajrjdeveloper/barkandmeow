/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

interface Badge {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

interface UserBadgesProps {
  userId?: string
  badges?: Badge[]
  showTooltip?: boolean
  className?: string
  badgeClassName?: string
}

export function UserBadges({
  userId,
  badges,
  showTooltip = true,
  className = "",
  badgeClassName = "h-6 w-6",
}: UserBadgesProps) {
  // Si no hay insignias, no mostrar nada
  if (!badges || badges.length === 0) return null

  return (
    <div className={`flex gap-1 ${className}`}>
      {badges.map((badge) => {
        const badgeElement = (
          <div key={badge.id} className={badgeClassName}>
            {badge.imageUrl ? (
              <Image
                src={badge.imageUrl || "/placeholder.svg?height=24&width=24"}
                alt={badge.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="bg-primary/10 text-primary rounded-full flex items-center justify-center h-full w-full text-xs">
                {badge.name.substring(0, 1)}
              </div>
            )}
          </div>
        )

        if (!showTooltip) return badgeElement

        return (
          <TooltipProvider key={badge.id}>
            <Tooltip>
              <TooltipTrigger asChild>{badgeElement}</TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  <p className="font-semibold">{badge.name}</p>
                  {badge.description && <p>{badge.description}</p>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </div>
  )
}

