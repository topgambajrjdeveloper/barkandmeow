import Image from "next/image"
import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative w-8 h-8 overflow-hidden">
        <Image src="/favicon.svg" alt="BarkAndMeow Logo" width={32} height={32} className="object-contain" />
      </div>
      <span className="font-bold text-xl">BarkAndMeow</span>
    </Link>
  )
}

