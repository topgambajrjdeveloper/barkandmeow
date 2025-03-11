import type { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-md mx-auto flex-col items-center justify-center bg-background p-4">
      <main className="w-full max-w-md pt-20">{children}</main>
    </div>
  );
}
