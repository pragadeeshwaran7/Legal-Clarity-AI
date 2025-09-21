
"use server";

import {
  analyzeLegalDocument,
  suggestAmendment,
  getSpeech as getSpeechFromAI,
  chatWithDocument,
  simplifyText as simplifyTextWithAI,
} from "@/ai/flows/legal-analysis";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";
import pdf from "pdf-parse";

type FormState = {
  data: AnalysisResult | null;
  error: string | null;
  documentText: string;
};

const DocumentSchema = z.object({
  text: z.string().optional(),
  file: z.instanceof(File).optional(),
}).refine(data => data.text || data.file, {
    message: "Either text or a PDF file must be provided.",
});


export async function analyzeDocument(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = DocumentSchema.safeParse({
        text: formData.get("text"),
        file: formData.get("file"),
    });

    if (!validatedFields.success) {
        return {
            data: null,
            error: validatedFields.error.flatten().formErrors.join(", ") ?? "Invalid input.",
            documentText: "",
        };
    }
    
    let documentText = validatedFields.data.text ?? "";

    if (validatedFields.data.file && validatedFields.data.file.size > 0) {
        try {
            const file = validatedFields.data.file;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const pdfData = await pdf(buffer);
            documentText = pdfData.text;
        } catch (e) {
            console.error(e);
            return {
                data: null,
                error: "Failed to parse the PDF file.",
                documentText: "",
            };
        }
    }

    if (!documentText || documentText.trim().length < 20) {
        return {
            data: null,
            error: "The document must contain at least 20 characters.",
            documentText: "",
        };
    }
    
    try {
        const analysis = await analyzeLegalDocument({ documentText });

        if (!analysis) {
            throw new Error("Failed to get a valid analysis from the AI.");
        }
        
        return {
            data: analysis,
            error: null,
            documentText: documentText,
        };

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
        return {
            data: null,
            error: `Analysis failed: ${errorMessage}`,
            documentText: documentText,
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

const SpeechSchema = z.object({
  text: z.string(),
});

export async function getSpeech(formData: FormData): Promise<{ media: string | null; error: string | null }> {
  const validatedFields = SpeechSchema.safeParse({ text: formData.get("text") });
  if (!validatedFields.success) {
    return { media: null, error: "Invalid text for speech synthesis." };
  }
  try {
    const result = await getSpeechFromAI(validatedFields.data.text);
    return { ...result, error: null };
  } catch (e) {
    console.error(e);
    return { media: null, error: "Failed to generate audio." };
  }
}

const ChatSchema = z.object({
  documentText: z.string(),
  question: z.string(),
});

export async function askChatbot(formData: FormData): Promise<{ answer: string | null; error: string | null }> {
    const validatedFields = ChatSchema.safeParse({
        documentText: formData.get("documentText"),
        question: formData.get("question"),
    });

    if (!validatedFields.success) {
        return { answer: null, error: "Invalid data for chatbot." };
    }
    
    try {
        const result = await chatWithDocument(validatedFields.data);
        return { answer: result.answer, error: null };
    } catch (e) {
        console.error(e);
        return { answer: null, error: "The chatbot failed to respond." };
    }
}

const SimplifySchema = z.object({
  text: z.string(),
});

export async function simplifyText(formData: FormData): Promise<{ simplifiedText: string | null; error: string | null }> {
  const validatedFields = SimplifySchema.safeParse({ text: formData.get("text") });

  if (!validatedFields.success) {
    return { simplifiedText: null, error: "Invalid text provided for simplification." };
  }
  
  try {
    const result = await simplifyTextWithAI({ text: validatedFields.data.text });
    return { simplifiedText: result.simplifiedText, error: null };
  } catch (e) {
    console.error(e);
    return { simplifiedText: null, error: "Failed to simplify text." };
  }
}
