
"use client";

import { Scale, LogOut, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "../ui/button";

export function AppHeader() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="w-full p-4 border-b no-print flex items-center justify-between gap-4 bg-card">
      <Link href="/" className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Legal Clarity AI
        </h1>
      </Link>
      <div>
        {loading ? (
          <Loader2 className="animate-spin" />
        ) : user ? (
          <Button variant="outline" onClick={signOut}>
            <LogOut />
            Sign Out
          </Button>
        ) : null}
      </div>
    </header>
  );
}
