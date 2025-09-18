"use server";

import { analyzeLegalDocument } from "@/ai/flows/analyze-legal-document";
import { assessDocumentRisk } from "@/ai/flows/assess-document-risk";
import { answerDocumentQuestions } from "@/ai/flows/answer-document-questions";
import { simplifyLegalJargon } from "@/ai/flows/simplify-legal-jargon";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";

const DocumentSchema = z.object({
  documentText: z.string().min(50, "Document text must be at least 50 characters long."),
});

type FormState = {
  data: AnalysisResult | null;
  error: string | null;
};

export async function analyzeDocument(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = DocumentSchema.safeParse({
    documentText: formData.get("documentText"),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.documentText?.join(", ") ?? "Invalid input.",
    };
  }

  const { documentText } = validatedFields.data;

  try {
    const [analysis, riskDetails] = await Promise.all([
      analyzeLegalDocument({ documentText }),
      assessDocumentRisk({ documentText }),
    ]);

    if (!analysis || !riskDetails) {
      throw new Error("Failed to get a valid analysis from the AI.");
    }

    return {
      data: {
        summary: analysis.summary,
        riskAssessment: analysis.riskAssessment,
        keyClauses: analysis.keyClauses,
        detailedRisks: riskDetails,
      },
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
    return {
      data: null,
      error: `Analysis failed: ${errorMessage}`,
    };
  }
}

export async function getAnswer(
  documentText: string,
  question: string
): Promise<{ answer: string | null; error: string | null }> {
  if (!question.trim()) {
    return { answer: null, error: "Question cannot be empty." };
  }
  try {
    const result = await answerDocumentQuestions({ documentText, question });
    return { answer: result.answer, error: null };
  } catch (e) {
    console.error(e);
    return { answer: null, error: "Failed to get an answer." };
  }
}

export async function getSimplified(
  documentText: string
): Promise<{ simplifiedText: string | null; error: string | null }> {
  try {
    const result = await simplifyLegalJargon({ legalText: documentText });
    return { simplifiedText: result.plainLanguageText, error: null };
  } catch (e) {
    console.error(e);
    return {
      simplifiedText: null,
      error: "Failed to simplify the document.",
    };
  }
}
