

import { AppHeader } from "@/components/legal-clarity-ai/app-header";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-grow flex items-center justify-center p-4">
                {children}
            </main>
        </div>
    );
}
