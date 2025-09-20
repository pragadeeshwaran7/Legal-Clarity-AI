import { Scale } from "lucide-react";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";
import Link from "next/link";

export function AppHeader() {
  // useSidebar can throw an error if not in a SidebarProvider.
  // We can use this to conditionally render the trigger.
  let sidebar;
  try {
    sidebar = useSidebar();
  } catch (e) {
    sidebar = null;
  }

  return (
    <header className="w-full p-4 border-b no-print flex items-center gap-4">
      {sidebar && <SidebarTrigger className="md:hidden"/>}
      <Link href="/dashboard" className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Legal Clarity AI
        </h1>
      </Link>
    </header>
  );
}
