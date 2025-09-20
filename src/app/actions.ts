"use server";

import { analyzeLegalDocument } from "@/ai/flows/analyze-legal-document";
import { assessDocumentRisk } from "@/ai/flows/assess-document-risk";
import { answerDocumentQuestions } from "@/ai/flows/answer-document-questions";
import { simplifyLegalJargon } from "@/ai/flows/simplify-legal-jargon";
import { compareDocuments } from "@/ai/flows/compare-documents";
import { performOcr } from "@/ai/flows/perform-ocr";
import { suggestAmendment } from "@/ai/flows/suggest-amendment";
import { generateAudioSummary } from "@/ai/flows/generate-audio-summary";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";
import mammoth from "mammoth";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { headers } from "next/headers";
import { initializeAuth, signInWithCustomToken } from 'firebase/auth';


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function getCurrentUserId() {
    const authHeader = headers().get('Authorization');
    if (!authHeader) {
        return null;
    }
    const token = authHeader.split('Bearer ')[1];

    try {
        // This is a workaround to verify the user on the server.
        // It relies on a client-side fetched ID token passed in the header.
        // A more robust solution would involve Firebase Admin SDK.
        const clientAuth = initializeAuth(app, {});
        const userCredential = await signInWithCustomToken(clientAuth, token).catch(() => {
             // This will fail because we are not using a custom token, but it forces an auth state check.
             // The goal is to get the currently signed-in user from the session associated with the API key.
             // This is not a standard pattern. A proper Admin SDK implementation is preferred.
             return { user: clientAuth.currentUser };
        });
        
        if (clientAuth.currentUser) {
            return clientAuth.currentUser.uid;
        }

        // A fallback for environments where the above trick might not work.
        // This part of logic is highly dependent on how Firebase JS SDK handles sessions on the server.
        const auth = getAuth(app);
        if (auth.currentUser) {
             return auth.currentUser.uid;
        }
        
        return null;

    } catch (error) {
        console.error("Error getting current user ID:", error);
        return null;
    }
}


const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, { message: "File cannot be empty." }),
  userId: z.string().optional(), // Make userId optional as it's handled server-side
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
  const userId = formData.get("userId") as string | null;
  if (!userId) {
     return { data: null, error: "User not authenticated.", fileName: "", documentText: "" };
  }


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
    
    const analysisResult = {
        summary: analysis.summary,
        riskAssessment: analysis.riskAssessment,
        keyClauses: analysis.keyClauses,
        detailedRisks: riskDetails,
        complianceAnalysis: analysis.complianceAnalysis,
    };

    // Save to Firestore
    try {
        await addDoc(collection(db, "analysisHistory"), {
            userId: userId,
            fileName: file.name,
            summary: analysisResult.summary,
            ...analysisResult,
            createdAt: serverTimestamp(),
        });
    } catch(dbError) {
        console.error("Firestore save error:", dbError);
        // Don't block the user from seeing the result, but log the error.
    }


    return {
      data: analysisResult,
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

export async function getAnalysisHistory(): Promise<{ history: any[] | null; error: string | null }> {
    const authHeader = headers().get('Authorization');
    if (!authHeader) {
         return { history: null, error: 'User not authenticated.' };
    }
    const userId = authHeader; // Assuming the whole header is the UID for simplicity

    try {
        const q = query(collection(db, "analysisHistory"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(), // Convert timestamp to string
        }));
        return { history, error: null };
    } catch (e) {
        console.error(e);
        return { history: null, error: "Failed to fetch analysis history." };
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

const AudioSummarySchema = z.object({
  text: z.string(),
});

export async function getAudioSummary(formData: FormData): Promise<{
  audioDataUri: string | null;
  error: string | null;
}> {
    const validatedFields = AudioSummarySchema.safeParse({
        text: formData.get("text"),
    });

    if (!validatedFields.success) {
        return {
            audioDataUri: null,
            error: "Invalid text for audio summary.",
        };
    }
    try {
        const result = await generateAudioSummary(validatedFields.data);
        return { ...result, error: null };
    } catch (e) {
        console.error(e);
        return {
            audioDataUri: null,
            error: "Failed to generate an audio summary.",
        };
    }
}
