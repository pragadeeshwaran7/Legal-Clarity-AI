
"use server";

import {
  analyzeLegalDocument,
  suggestAmendment,
} from "@/ai/flows/legal-analysis";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";

type FormState = {
  data: AnalysisResult | null;
  error: string | null;
  documentText: string;
};

const TextSchema = z.object({
  text: z.string().min(20, "Pasted text must be at least 20 characters long."),
});

export async function analyzeText(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = TextSchema.safeParse({
        text: formData.get("text"),
    });

    if (!validatedFields.success) {
        return {
            data: null,
            error: validatedFields.error.flatten().fieldErrors.text?.join(", ") ?? "Invalid text input.",
            documentText: "",
        };
    }

    const { text } = validatedFields.data;
    
    try {
        const analysis = await analyzeLegalDocument({ documentText: text });

        if (!analysis) {
            throw new Error("Failed to get a valid analysis from the AI.");
        }
        
        return {
            data: analysis,
            error: null,
            documentText: text,
        };

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
        return {
            data: null,
            error: `Analysis failed: ${errorMessage}`,
            documentText: text,
        };
    }
}

const AmendmentSchema = z.object({
  originalClause: z.string(),
  riskExplanation: z.string(),
});

export async function getAmendment(formData: FormData): Promise<{
  suggestedAmendment: string | null;
  explanation: string | null;
  error: string | null;
}> {
  const validatedFields = AmendmentSchema.safeParse({
    originalClause: formData.get("originalClause"),
    riskExplanation: formData.get("riskExplanation"),
  });

  if (!validatedFields.success) {
    return {
      suggestedAmendment: null,
      explanation: null,
      error: "Invalid data for amendment.",
    };
  }
  try {
    const result = await suggestAmendment(validatedFields.data);
    return { ...result, error: null };
  } catch (e) {
    console.error(e);
    return {
      suggestedAmendment: null,
      explanation: null,
      error: "Failed to generate an amendment.",
    };
  }
}
