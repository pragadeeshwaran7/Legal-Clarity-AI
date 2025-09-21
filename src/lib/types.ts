
import type { 
    AnalyzeLegalDocumentOutput,
    ChatOutput,
    SuggestAmendmentOutput,
    SimplifyTextOutput
 } from "@/ai/flows/legal-analysis";

export type AnalysisResult = AnalyzeLegalDocumentOutput;
export type ChatMessage = ChatOutput;
export type AmendmentSuggestion = SuggestAmendmentOutput;
export type SimplifiedText = SimplifyTextOutput;
