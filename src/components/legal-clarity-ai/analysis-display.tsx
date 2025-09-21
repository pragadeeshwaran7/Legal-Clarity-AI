
"use client";

import { Printer, RotateCcw } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RiskAssessmentSection } from "./risk-assessment-section";

type AnalysisDisplayProps = {
  analysisResult: AnalysisResult;
  onReset: () => void;
};

export function AnalysisDisplay({
  analysisResult,
  onReset,
}: AnalysisDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-area w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold font-headline">Analysis Complete</h2>
          <p className="text-muted-foreground">
            Review your document's summary and risks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw />
            New Analysis
          </Button>
          <Button onClick={handlePrint}>
            <Printer />
            Export
          </Button>
        </div>
      </div>

      <div className="printable-content mt-6">
        <RiskAssessmentSection
          summary={analysisResult.summary}
          keyClauses={analysisResult.keyClauses}
          riskAssessment={analysisResult.riskAssessment}
          detailedRisks={analysisResult.detailedRisks}
          complianceAnalysis={analysisResult.complianceAnalysis}
        />
      </div>
    </div>
  );
}
