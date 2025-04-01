"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

import Image from "next/image"

interface PremiumBadgeProps {
  showTooltip?: boolean
  className?: string
}

export function PremiumBadge({ showTooltip = true, className = "" }: PremiumBadgeProps) {
  const badge = (
    <Badge
      className={`bg-amber-100 text-amber-800 dark:bg-primary dark:text-background flex items-center gap-1 ${className}`}
    >
      <Image src='/badges/premium.png' alt="" height={30} width={30} className="h-3 w-3" />
            <span>Premium</span>
    </Badge>
  )

  if (!showTooltip) return badge

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Usuario Premium con plaza reservada en eventos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

