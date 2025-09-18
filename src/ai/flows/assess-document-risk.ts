'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing the risk associated with legal documents.
 *
 * - assessDocumentRisk - A function that assesses the risk of a document.
 * - AssessDocumentRiskInput - The input type for the assessDocumentRisk function.
 * - AssessDocumentRiskOutput - The return type for the assessDocumentRisk function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessDocumentRiskInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text of the legal document to assess.'),
});

export type AssessDocumentRiskInput = z.infer<typeof AssessDocumentRiskInputSchema>;

const RiskAssessmentSchema = z.object({
  clause: z.string().describe('The specific clause being assessed.'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The risk level of the clause (Low, Medium, or High).'),
  explanation: z.string().describe('An explanation of why the clause is considered risky.'),
});

const AssessDocumentRiskOutputSchema = z.array(RiskAssessmentSchema).describe('An array of risk assessments for each clause in the document.');

export type AssessDocumentRiskOutput = z.infer<typeof AssessDocumentRiskOutputSchema>;

export async function assessDocumentRisk(input: AssessDocumentRiskInput): Promise<AssessDocumentRiskOutput> {
  return assessDocumentRiskFlow(input);
}

const assessDocumentRiskPrompt = ai.definePrompt({
  name: 'assessDocumentRiskPrompt',
  input: {schema: AssessDocumentRiskInputSchema},
  output: {schema: AssessDocumentRiskOutputSchema},
  prompt: `You are an AI legal assistant tasked with assessing the risk associated with legal documents.

  Analyze the following legal document and identify clauses that may put the user at a significant disadvantage or contain excessive obligations. For each such clause, provide a risk level (Low, Medium, or High) and an explanation.

  Document:
  {{documentText}}

  Format your output as a JSON array of objects, where each object has the following fields:
  - clause: The specific clause being assessed.
  - riskLevel: The risk level of the clause (Low, Medium, or High).
  - explanation: An explanation of why the clause is considered risky.
  `,
});

const assessDocumentRiskFlow = ai.defineFlow(
  {
    name: 'assessDocumentRiskFlow',
    inputSchema: AssessDocumentRiskInputSchema,
    outputSchema: AssessDocumentRiskOutputSchema,
  },
  async input => {
    const {output} = await assessDocumentRiskPrompt(input);
    return output!;
  }
);
