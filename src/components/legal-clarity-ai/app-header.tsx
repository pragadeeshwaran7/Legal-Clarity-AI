import { Scale } from "lucide-react";

export function AppHeader() {
  return (
    <header className="w-full p-4 border-b no-print">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <Scale className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-headline font-bold text-foreground">
          Legal Clarity AI
        </h1>
      </div>
    </header>
  );
}
