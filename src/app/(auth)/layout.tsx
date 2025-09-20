
import { Scale } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
                <div className="shape-1" />
                <div className="shape-2" />
                <div className="shape-3" />
            </div>

            <div className="relative z-10 flex w-full max-w-md flex-col items-center p-4">
                 <Link href="/" className="mb-8 flex items-center gap-3 text-foreground">
                    <Scale className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-headline font-bold">
                    Legal Clarity AI
                    </h1>
                </Link>
                
                <div className="w-full rounded-2xl border border-border/20 bg-card/60 p-6 shadow-2xl backdrop-blur-lg">
                     {children}
                </div>
            </div>
        </div>
    );
}
