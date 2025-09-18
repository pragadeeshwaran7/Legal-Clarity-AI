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
});
export type AnalyzeLegalDocumentOutput = z.infer<typeof AnalyzeLegalDocumentOutputSchema>;

export async function analyzeLegalDocument(input: AnalyzeLegalDocumentInput): Promise<AnalyzeLegalDocumentOutput> {
  return analyzeLegalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLegalDocumentPrompt',
  input: {schema: AnalyzeLegalDocumentInputSchema},
  output: {schema: AnalyzeLegalDocumentOutputSchema},
  prompt: `You are an AI legal assistant specializing in analyzing legal documents.

  Analyze the following legal document and provide a summary, risk assessment, and explanations of key clauses.
  Take into account the document type and analysis mode to tailor the response.

  Document Type: {{documentType}}
  Analysis Mode: {{analysisMode}}

  Document Text: {{{documentText}}}

  Summary:
  Risk Assessment:
  Key Clauses:`,
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
