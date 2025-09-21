
"use server";

import {
  analyzeLegalDocument,
  answerDocumentQuestions,
  simplifyLegalJargon,
  compareDocuments,
  performOcr,
  suggestAmendment,
  generateAudioSummary,
} from "@/ai/flows/legal-analysis";
import { z } from "zod";
import type { AnalysisResult } from "@/lib/types";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { getApps, initializeApp, getApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import * as admin from 'firebase-admin';

// Firebase Admin SDK Initialization
if (!admin.apps.length) {
  try {
    // This will use Application Default Credentials in a deployed environment.
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed with default credentials.', error);
    // For local development, it will fall back to the service account from environment variables.
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (e) {
        console.error('Failed to initialize Firebase Admin with service account. Ensure FIREBASE_SERVICE_ACCOUNT is set correctly in your .env file for local development.', e);
    }
  }
}

// Client-side Firebase App Initialization
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

// Helper to get user ID from token
async function getUserIdFromToken(token: string | null) {
  if (!token) return null;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Error verifying ID token:", error);
    return null;
  }
}

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
    const data = await pdf(Buffer.from(buffer));
    return data.text;
}

async function getTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  
  if (file.type === "application/pdf") {
      return getTextFromPdf(buffer);
  }
  
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return getTextFromDocx(buffer);
  }
  
  if (file.type === "text/plain") {
    return new TextDecoder().decode(buffer);
  }

  throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, DOCX, or TXT file.`);
}

const TextSchema = z.object({
  text: z.string().min(20, "Pasted text must be at least 20 characters long."),
  idToken: z.string().optional(),
});

export async function analyzeText(prevState: FormState, formData: FormData): Promise<FormState> {
    const validatedFields = TextSchema.safeParse({
        text: formData.get("text"),
        idToken: formData.get("idToken"),
    });

    if (!validatedFields.success) {
        return {
            data: null,
            error: validatedFields.error.flatten().fieldErrors.text?.join(", ") ?? "Invalid text input.",
            fileName: "Pasted Text",
            documentText: "",
        };
    }

    const { text, idToken } = validatedFields.data;
    const userId = await getUserIdFromToken(idToken || null);

    if (!userId) {
        return { data: null, error: "User not authenticated. Please sign in again.", fileName: "Pasted Text", documentText: "" };
    }
    
    try {
        const analysis = await analyzeLegalDocument({ documentText: text });

        if (!analysis) {
            throw new Error("Failed to get a valid analysis from the AI.");
        }
        
        const analysisResult: AnalysisResult = {
            summary: analysis.summary,
            riskAssessment: analysis.riskAssessment,
            keyClauses: analysis.keyClauses,
            detailedRisks: analysis.detailedRisks,
            complianceAnalysis: analysis.complianceAnalysis,
        };

        try {
            await addDoc(collection(db, "analysisHistory"), {
                userId: userId,
                fileName: "Pasted Text",
                summary: analysisResult.summary,
                documentText: text,
                ...analysisResult,
                createdAt: serverTimestamp(),
            });
        } catch(dbError) {
            console.error("Firestore save error:", dbError);
        }

        return {
            data: analysisResult,
            error: null,
            fileName: "Pasted Text",
            documentText: text,
        };

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during analysis.";
        return {
            data: null,
            error: `Analysis failed: ${errorMessage}`,
            fileName: "Pasted Text",
            documentText: text,
        };
    }
}


const FileSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size > 0, { message: "File cannot be empty." }),
  idToken: z.string().optional(),
});

export async function analyzeDocument(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = FileSchema.safeParse({
    file: formData.get("file"),
    idToken: formData.get("idToken"),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors.file?.join(", ") ?? "Invalid file input.",
      fileName: "",
      documentText: "",
    };
  }

  const { file, idToken } = validatedFields.data;

  let documentText = "";
  try {
    documentText = await getTextFromFile(file);
    if (!documentText || documentText.trim().length < 20) {
      return {
        data: null,
        error: "Could not extract sufficient text from the document. It might be empty, password-protected, or an image-based PDF. Try pasting the text instead.",
        fileName: file.name,
        documentText: "",
      }
    }
  } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred during file processing.";
      return { data: null, error: `Failed to read file: ${errorMessage}`, fileName: file.name, documentText: "" };
  }

  const newFormData = new FormData();
  newFormData.append('text', documentText);
  if (idToken) {
      newFormData.append('idToken', idToken);
  }
  
  const textAnalysisResult = await analyzeText({
      data: null,
      error: null,
      fileName: file.name,
      documentText: "",
  }, newFormData);

  return {
      ...textAnalysisResult,
      fileName: file.name, // Ensure original file name is preserved
  };
}

export async function getAnalysisHistory(token: string): Promise<{ history: any[] | null; error: string | null }> {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
         return { history: null, error: 'User not authenticated or token is invalid.' };
    }

    try {
        const q = query(collection(db, "analysisHistory"), where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const history = querySnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toISOString(),
        }));
        return { history, error: null };
    } catch (e) {
        console.error(e);
        return { history: null, error: "Failed to fetch analysis history." };
    }
}

export async function getAnalysisById(id: string, token: string): Promise<{ data: any | null; error: string | null }> {
    const userId = await getUserIdFromToken(token);
    if (!userId) {
         return { data: null, error: 'User not authenticated or token is invalid.' };
    }

    try {
        const docRef = doc(db, "analysisHistory", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { data: null, error: "Analysis not found." };
        }

        const data = docSnap.data();
        if (data.userId !== userId) {
            return { data: null, error: "You are not authorized to view this analysis." };
        }
        
        return { 
            data: {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt.toDate().toISOString(),
            }, 
            error: null 
        };
    } catch (e) {
        console.error(e);
        return { data: null, error: "Failed to fetch analysis details." };
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

    