"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, PlusSquare,LayoutDashboard } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

export function MobileNavigation() {
  const pathname = usePathname();
  const { user } = useUser();
  const userRole = user?.role || "";

  if (!user) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/feed"
          className={`flex flex-col items-center ${
            pathname === "/feed" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Feed</span>
        </Link>
        <Link
          href="/create"
          className={`flex flex-col items-center ${
            pathname === "/create" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <PlusSquare size={24} />
          <span className="text-xs">Crear</span>
        </Link>
        <Link
          href="/explore"
          className={`flex flex-col items-center ${
            pathname === "/explore" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <Compass size={24} />
          <span className="text-xs">Explorar</span>
        </Link>
        {user && userRole === "ADMIN" && (
          <Link
            href="/admin"
            className={`flex flex-col items-center ${
              pathname === "/admin" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <LayoutDashboard size={24} />
            <span className="text-xs">Admin</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
