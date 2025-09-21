
"use client";

import { useState } from "react";
import Image from "next/image";
import type { AnalysisResult } from "@/lib/types";

import { FileUpload } from "@/components/legal-clarity-ai/file-upload";
import { AnalysisDisplay } from "@/components/legal-clarity-ai/analysis-display";
import { placeholderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/legal-clarity-ai/app-header";

function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const heroImage = placeholderImages.find(p => p.id === "hero-image");

  return (
    <div className="w-full flex flex-col items-center">
        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden shadow-2xl mb-8">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="brightness-75"
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 text-shadow-lg">
                    AI-Powered Legal Clarity
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mb-8 text-shadow">
                    Paste your legal text and get instant summaries, risk assessments, and compliance checks.
                </p>
                <Button size="lg" onClick={onGetStarted}>
                    Get Started
                </Button>
            </div>
        </div>
    </div>
  );
}


export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [key, setKey] = useState(Date.now());
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult | null, text: string, error?: string | null) => {
    if (result && text) {
      setAnalysisResult(result);
      setDocumentText(text);
      setShowFileUpload(false);
    } else {
      console.error(error || "Analysis failed. Please try again.");
      setAnalysisResult(null);
      setDocumentText("");
      setShowFileUpload(true); 
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setDocumentText("");
    setShowFileUpload(false);
    setKey(Date.now());
  };

  return (
     <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
         {analysisResult ? (
            <AnalysisDisplay
              analysisResult={analysisResult}
              onReset={handleReset}
            />
          ) : (
            showFileUpload ? (
              <div className="w-full max-w-3xl">
                  <FileUpload key={key} onAnalysisComplete={handleAnalysisComplete} />
              </div>
            ) : (
              <HeroSection onGetStarted={() => setShowFileUpload(true)} />
            )
          )}
        </main>
         <footer className="text-center p-4 text-sm text-muted-foreground no-print">
            <p>Legal Clarity AI. Your AI-powered legal assistant.</p>
        </footer>
    </div>
  );
}
