
import type { AnalyzeLegalDocumentOutput } from "@/ai/flows/legal-analysis";

export type AnalysisResult = {
  summary: AnalyzeLegalDocumentOutput["summary"];
  riskAssessment: AnalyzeLegalDocumentOutput["riskAssessment"];
  keyClauses: AnalyzeLegalDocumentOutput["keyClauses"];
  detailedRisks: AnalyzeLegalDocumentOutput["detailedRisks"];
  complianceAnalysis: AnalyzeLegalDocumentOutput["complianceAnalysis"];
};

export type QAMessage = {
  role: "user" | "assistant";
  content: string;
};

    