
"use client";

import { Printer, RotateCcw } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RiskAssessmentSection } from "./risk-assessment-section";
import { LegalChatbot } from "./legal-chatbot";
import { ClauseComparer } from "./clause-comparer";
import { TextSimplifier } from "./text-simplifier";
import { Card } from "../ui/card";

type AnalysisDisplayProps = {
  analysisResult: AnalysisResult;
  documentText: string;
  onReset: () => void;
};

export function AnalysisDisplay({
  analysisResult,
  documentText,
  onReset,
}: AnalysisDisplayProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-3xl font-bold font-headline">Analysis Complete</h2>
          <p className="text-muted-foreground">
            Explore your document's analysis using the tabs below.
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

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4 no-print">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="chatbot">Legal Chatbot</TabsTrigger>
          <TabsTrigger value="comparer">Clause Comparer</TabsTrigger>
          <TabsTrigger value="simplifier">Text Simplifier</TabsTrigger>
        </TabsList>
        <TabsContent value="analysis">
           <div className="printable-content mt-6">
                <RiskAssessmentSection
                    summary={analysisResult.summary}
                    keyClauses={analysisResult.keyClauses}
                    riskAssessment={analysisResult.riskAssessment}
                    detailedRisks={analysisResult.detailedRisks}
                    complianceAnalysis={analysisResult.complianceAnalysis}
                />
            </div>
        </TabsContent>
        <TabsContent value="chatbot">
            <Card className="mt-6">
                <LegalChatbot documentText={documentText} />
            </Card>
        </TabsContent>
        <TabsContent value="comparer">
            <Card className="mt-6">
                <ClauseComparer detailedRisks={analysisResult.detailedRisks} />
            </Card>
        </TabsContent>
        <TabsContent value="simplifier">
            <Card className="mt-6">
                <TextSimplifier documentText={documentText} />
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
