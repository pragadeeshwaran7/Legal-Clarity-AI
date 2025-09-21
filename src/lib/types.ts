import type { AnalyzeLegalDocumentOutput, AssessDocumentRiskOutput } from "@/ai/flows/legal-analysis";

export type AnalysisResult = {
  summary: AnalyzeLegalDocumentOutput["summary"];
  riskAssessment: AnalyzeLegalDocumentOutput["riskAssessment"];
  keyClauses: AnalyzeLegalDocumentOutput["keyClauses"];
  complianceAnalysis: AnalyzeLegalDocumentOutput["complianceAnalysis"];
  detailedRisks: AssessDocumentRiskOutput["detailedRisks"];
};

export type QAMessage = {
  role: "user" | "assistant";
  content: string;
};