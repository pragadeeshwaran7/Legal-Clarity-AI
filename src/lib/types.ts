import type { AnalyzeLegalDocumentOutput } from "@/ai/flows/analyze-legal-document";
import type { AssessDocumentRiskOutput } from "@/ai/flows/assess-document-risk";

export type AnalysisResult = {
  summary: AnalyzeLegalDocumentOutput["summary"];
  riskAssessment: AnalyzeLegalDocumentOutput["riskAssessment"];
  keyClauses: AnalyzeLegalDocumentOutput["keyClauses"];
  detailedRisks: AssessDocumentRiskOutput;
  complianceAnalysis: AnalyzeLegalDocumentOutput["complianceAnalysis"];
};

export type QAMessage = {
  role: "user" | "assistant";
  content: string;
};
