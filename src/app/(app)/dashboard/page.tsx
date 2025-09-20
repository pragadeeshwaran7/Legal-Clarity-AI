
"use client";

import { useState } from "react";
import Image from "next/image";
import type { AnalysisResult } from "@/lib/types";

import { FileUpload } from "@/components/legal-clarity-ai/file-upload";
import { AnalysisDisplay } from "@/components/legal-clarity-ai/analysis-display";
import { placeholderImages } from "@/lib/placeholder-images";
import { Button } from "@/components/ui/button";

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
                    Upload your legal documents and get instant summaries, risk assessments, and answers to your questions.
                </p>
                <Button size="lg" onClick={onGetStarted}>
                    Get Started
                </Button>
            </div>
        </div>
    </div>
  );
}


export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now());
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleAnalysisComplete = (result: AnalysisResult | null, text: string, name: string, error?: string | null) => {
    if (result && text) {
      setAnalysisResult(result);
      setDocumentText(text);
      setFileName(name);
      setError(null);
      setShowFileUpload(false);
    } else {
      setError(error || "Analysis failed. Please try again.");
      setAnalysisResult(null);
      setDocumentText("");
      setFileName(name);
      setShowFileUpload(true); // Keep file upload visible on error
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setDocumentText("");
    setFileName("");
    setError(null);
    setShowFileUpload(false);
    setKey(Date.now());
  };

  if (analysisResult) {
     return (
        <AnalysisDisplay
          analysisResult={analysisResult}
          documentText={documentText}
          fileName={fileName}
          onReset={handleReset}
        />
      );
  }

  return (
    <div className="w-full flex-grow flex flex-col items-center">
      {showFileUpload ? (
         <div className="w-full max-w-3xl mt-8">
            <FileUpload key={key} onAnalysisComplete={handleAnalysisComplete} />
         </div>
      ) : (
        <HeroSection onGetStarted={() => setShowFileUpload(true)} />
      )}
    </div>
  );
}
