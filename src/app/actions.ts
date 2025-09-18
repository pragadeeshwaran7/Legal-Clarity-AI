"use server";

import { analyzeLegalDocument } from "@/ai/flows/analyze-legal-document";
import { assessDocumentRisk } from "@/ai/flows/assess-document-risk";
import { answerDocumentQuestions } from "@/ai/flows/answer-document-questions";
import { simplifyLegalJargon } from "@/ai/flows/simplify-legal-jargon";
import { compareDocuments } from "@/ai/flows/compare-documents";
import { performOcr } from "@/ai/flows/perform-ocr";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";
import mammoth from "mammoth";


const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "File cannot be empty." }),
});

type FormState = {
  data: AnalysisResult | null;
  error: string | null;
  fileName: string;
  documentText: string;
};

async function getTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

async function getTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  // Use OCR for all PDFs to handle both text-based and scanned documents.
  return getTextFromImage(buffer, "application/pdf");
}

async function getTextFromImage(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  const b64 = Buffer.from(buffer).toString('base64');
  const dataUri = `data:${mimeType};base64,${b64}`;
  const result = await performOcr({ imageDataUri: dataUri });
  return result.text;
}


async function getTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  if (file.type.startsWith("image/")) {
    return getTextFromImage(buffer, file.type);
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return getTextFromDocx(buffer);
  }

  if (file.type === "application/pdf") {
    return getTextFromPdf(buffer);
  }
  
  return new TextDecoder().decode(buffer);
}

export async function analyzeDocument(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = FileSchema.safeParse({
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error:
        validatedFields.error.flatten().fieldErrors.file?.join(", ") ??
        "Invalid input.",
      fileName: "",
      documentText: "",
    };
  }
  const { file } = validatedFields.data;

  let documentText = "";
  try {
    documentText = await getTextFromFile(file);
    if (!documentText || documentText.length < 20) {
      return {
        data: null,
        error: "Could not extract sufficient text from the document. It might be empty, scanned, or in an unsupported format.",
        fileName: file.name,
        documentText: "",
      }
    }

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
      fileName: file.name,
      documentText,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : "An unknown error occurred during analysis.";
    return {
      data: null,
      error: `Analysis failed: ${errorMessage}`,
      fileName: file.name,
      documentText: "",
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

const CompareSchema = z.object({
  originalDocumentText: z.string(),
  file: z.instanceof(File),
});

export async function getComparison(
  formData: FormData
): Promise<{ comparison: string | null; error: string | null }> {
  const validatedFields = CompareSchema.safeParse({
    originalDocumentText: formData.get("originalDocumentText"),
    file: formData.get("file"),
  });

  if (!validatedFields.success) {
    return { comparison: null, error: "Invalid data for comparison." };
  }

  const { originalDocumentText, file } = validatedFields.data;

  try {
    const newDocumentText = await getTextFromFile(file);
    if (!newDocumentText || newDocumentText.length < 20) {
       return { comparison: null, error: "Could not extract sufficient text from the second document." };
    }
    const result = await compareDocuments({
      document1: originalDocumentText,
      document2: newDocumentText,
    });
    return { comparison: result.comparison, error: null };
  } catch (e) {
    console.error(e);
    return { comparison: null, error: "Failed to compare documents." };
  }
}
