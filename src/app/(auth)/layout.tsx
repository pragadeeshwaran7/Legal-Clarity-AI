import { AppHeader } from "@/components/legal-clarity-ai/app-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-grow flex items-center justify-center">
                {children}
            </main>
            <footer className="text-center p-4 text-sm text-muted-foreground">
                <p>Legal Clarity AI. Your AI-powered legal assistant.</p>
            </footer>
        </div>
    );
}
