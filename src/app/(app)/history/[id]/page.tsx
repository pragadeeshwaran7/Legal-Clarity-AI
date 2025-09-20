
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAnalysisById } from "@/app/actions";
import { AnalysisDisplay } from "@/components/legal-clarity-ai/analysis-display";
import { Loader2, ShieldX } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type AnalysisData = {
    id: string;
    fileName: string;
    documentText: string;
} & AnalysisResult;


export default function HistoryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      setIsLoading(true);
      setError(null);
      const { data, error: fetchError } = await getAnalysisById(params.id);
      
      if (fetchError) {
        setError(fetchError);
      } else if (data) {
        setAnalysisData(data);
      } else {
        setError("Could not find the requested analysis.");
      }
      setIsLoading(false);
    }

    fetchAnalysis();
  }, [params.id]);
  
  const handleReset = () => {
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
     return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <ShieldX className="h-4 w-4" />
        <AlertTitle>Error Loading History</AlertTitle>
        <AlertDescription>
            {error}
            <div className="mt-4">
                <Button variant="secondary" onClick={() => router.push('/history')}>Back to History</Button>
            </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (analysisData) {
    return (
      <AnalysisDisplay
        analysisResult={analysisData}
        documentText={analysisData.documentText}
        fileName={analysisData.fileName}
        onReset={handleReset}
      />
    );
  }

  return null;
}
