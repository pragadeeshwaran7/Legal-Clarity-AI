
"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

import { FileUpload } from "@/components/legal-clarity-ai/file-upload";
import { AnalysisDisplay } from "@/components/legal-clarity-ai/analysis-display";
import { AppHeader } from "@/components/legal-clarity-ai/app-header";
import { useAuth } from "@/lib/auth";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Scale } from 'lucide-react';


function SignIn() {
  const { loading, signInWithGoogle } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <Scale className="h-10 w-10 text-primary"/>
            </div>
            <CardTitle className="font-headline text-3xl">Welcome to Legal Clarity AI</CardTitle>
            <CardDescription>
                Sign in to continue to your AI-powered legal assistant.
            </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
             </div>
          ) : (
            <Button className="w-full" onClick={signInWithGoogle}>
                Sign In with Google
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function Home() {
  const { user, loading } = useAuth();
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [key, setKey] = useState(Date.now());


  const handleAnalysisComplete = (result: AnalysisResult | null, text: string, error?: string | null) => {
    if (result && text) {
      setAnalysisResult(result);
    } else {
      console.error(error || "Analysis failed. Please try again.");
      setAnalysisResult(null);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setKey(Date.now());
  };

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
    )
  }

  if (!user) {
    return <SignIn />;
  }

  return (
     <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center">
         {analysisResult ? (
            <AnalysisDisplay
              analysisResult={analysisResult}
              onReset={handleReset}
            />
          ) : (
            <div className="w-full max-w-3xl">
                <FileUpload key={key} onAnalysisComplete={handleAnalysisComplete} />
            </div>
          )}
        </main>
         <footer className="text-center p-4 text-sm text-muted-foreground no-print">
            <p>Legal Clarity AI. Your AI-powered legal assistant.</p>
        </footer>
    </div>
  );
}
