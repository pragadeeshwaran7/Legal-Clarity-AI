import { config } from 'dotenv';
config();

import '@/ai/flows/assess-document-risk.ts';
import '@/ai/flows/answer-document-questions.ts';
import '@/ai/flows/simplify-legal-jargon.ts';
import '@/ai/flows/analyze-legal-document.ts';
import '@/ai/flows/compare-documents.ts';
import '@/ai/flows/perform-ocr.ts';
