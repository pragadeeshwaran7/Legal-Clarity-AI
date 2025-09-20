'use server';

/**
 * @fileOverview An AI agent for analyzing legal documents.
 *
 * - analyzeLegalDocument - A function that handles the legal document analysis process.
 * - AnalyzeLegalDocumentInput - The input type for the analyzeLegalDocument function.
 * - AnalyzeLegalDocumentOutput - The return type for the analyzeLegalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLegalDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to be analyzed.'),
  documentType: z
    .string()
    .optional()
    .describe('The type of legal document (e.g., rental agreement, loan contract).'),
  analysisMode: z
    .enum(['Comprehensive', 'Quick'])
    .default('Comprehensive')
    .describe('The mode of analysis: Comprehensive or Quick.'),
});
export type AnalyzeLegalDocumentInput = z.infer<typeof AnalyzeLegalDocumentInputSchema>;

const AnalyzeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the legal document.'),
  riskAssessment: z.string().describe('An assessment of potential risks in the document.'),
  keyClauses: z.string().describe('Explanations of the key clauses in the document.'),
  complianceAnalysis: z.string().describe('An analysis of the document\'s compliance with relevant laws and regulations, including potential legal consequences for non-compliance.'),
});
export type AnalyzeLegalDocumentOutput = z.infer<typeof AnalyzeLegalDocumentOutputSchema>;

export async function analyzeLegalDocument(input: AnalyzeLegalDocumentInput): Promise<AnalyzeLegalDocumentOutput> {
  return analyzeLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLegalDocumentPrompt',
  input: {schema: AnalyzeLegalDocumentInputSchema},
  output: {schema: AnalyzeLegalDocumentOutputSchema},
  prompt: `You are an AI legal assistant specializing in analyzing legal documents. Your analysis must be thorough and include legal compliance checks.

  Analyze the following legal document and provide:
  1. A summary of the document.
  2. A general risk assessment.
  3. Explanations of key clauses.
  4. A detailed compliance analysis. If the document or any of its clauses are found to be potentially illegal or non-compliant, you must specify the relevant laws, regulations, or legal principles that are being violated and explain the potential legal consequences (e.g., fines, unenforceability).

  Take into account the document type and analysis mode to tailor the response.

  Document Type: {{documentType}}
  Analysis Mode: {{analysisMode}}

  Document Text: {{{documentText}}}
  `,
});

const analyzeLegalDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeLegalDocumentFlow',
    inputSchema: AnalyzeLegalDocumentInputSchema,
    outputSchema: AnalyzeLegalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
