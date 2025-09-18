"use client";

import {
  FileText,
  MessageCircle,
  Printer,
  RotateCcw,
  ScanSearch,
  Users,
} from "lucide-react";

import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskAssessmentSection } from "./risk-assessment-section";
import { QandASection } from "./q-and-a-section";
import { SimplifiedViewSection } from "./simplified-view-section";
import { ComparisonSection } from "./comparison-section";

type AnalysisDisplayProps = {
  analysisResult: AnalysisResult;
  documentText: string;
  fileName: string;
  onReset: () => void;
};

export function AnalysisDisplay({
  analysisResult,
  documentText,
  fileName,
  onReset,
}: AnalysisDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 printable-area">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold font-headline">Analysis Complete</h2>
          <p className="text-muted-foreground">
            {fileName ? `Showing results for ${fileName}.` : "Review your document's summary, risks, and ask questions."}
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

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 no-print">
          <TabsTrigger value="summary">
            <ScanSearch className="mr-2" />
            Summary & Risks
          </TabsTrigger>
          <TabsTrigger value="qa">
            <MessageCircle className="mr-2" />
            Interactive Q&A
          </TabsTrigger>
          <TabsTrigger value="simplified">
            <FileText className="mr-2" />
            Simplified View
          </TabsTrigger>
          <TabsTrigger value="compare">
            <Users className="mr-2" />
            Compare
          </TabsTrigger>
        </TabsList>

        <div className="printable-content">
          <TabsContent value="summary" className="mt-6">
            <RiskAssessmentSection
              summary={analysisResult.summary}
              keyClauses={analysisResult.keyClauses}
              riskAssessment={analysisResult.riskAssessment}
              detailedRisks={analysisResult.detailedRisks}
            />
          </TabsContent>
          <TabsContent value="qa" className="mt-6">
            <QandASection documentText={documentText} />
          </TabsContent>
          <TabsContent value="simplified" className="mt-6">
            <SimplifiedViewSection documentText={documentText} />
          </TabsContent>
          <TabsContent value="compare" className="mt-6">
            <ComparisonSection originalDocumentText={documentText} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
