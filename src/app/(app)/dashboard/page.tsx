"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/lib/types";

import { FileUpload } from "@/components/legal-clarity-ai/file-upload";
import { AnalysisDisplay } from "@/components/legal-clarity-ai/analysis-display";

export default function DashboardPage() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [documentText, setDocumentText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now()); // Used to reset the component

  const handleAnalysisComplete = (result: AnalysisResult | null, text: string, name: string, error?: string | null) => {
    if (result && text) {
      setAnalysisResult(result);
      setDocumentText(text);
      setFileName(name);
      setError(null);
    } else {
      setError(error || "Analysis failed. Please try again.");
      setAnalysisResult(null);
      setDocumentText("");
      setFileName(name);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setDocumentText("");
    setFileName("");
    setError(null);
    setKey(Date.now()); // Change key to force re-mount of FileUpload
  };

  return (
    <>
      {!analysisResult ? (
        <FileUpload key={key} onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <AnalysisDisplay
          analysisResult={analysisResult}
          documentText={documentText}
          fileName={fileName}
          onReset={handleReset}
        />
      )}
    </>
  );
}
