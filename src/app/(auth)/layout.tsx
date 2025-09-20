import Image from "next/image";
import { AppHeader } from "@/components/legal-clarity-ai/app-header";
import { placeholderImages } from "@/lib/placeholder-images";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    const authImage = placeholderImages.find(p => p.id === "auth-image");
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <AppHeader />
            <main className="flex-grow grid grid-cols-1 md:grid-cols-2 items-center">
                <div className="hidden md:flex h-full w-full items-center justify-center p-8 bg-muted/50">
                    <div className="relative w-full h-full max-w-md aspect-square">
                        {authImage && (
                            <Image
                                src={authImage.imageUrl}
                                alt={authImage.description}
                                fill
                                style={{ objectFit: "contain" }}
                                className="drop-shadow-2xl"
                                data-ai-hint={authImage.imageHint}
                            />
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-center p-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
