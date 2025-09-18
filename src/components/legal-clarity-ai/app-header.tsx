import { Scale } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";

export function AppHeader() {
  return (
    <header className="w-full p-4 border-b no-print flex items-center gap-4">
      <SidebarTrigger className="md:hidden"/>
      <div className="flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Legal Clarity AI
        </h1>
      </div>
    </header>
  );
}
