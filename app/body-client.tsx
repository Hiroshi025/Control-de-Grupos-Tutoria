"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider } from "@/hooks/use-auth";

export function BodyClient({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {children}
    </AuthProvider>
  );
}
