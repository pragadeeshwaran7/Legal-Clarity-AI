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
  complianceIssues: z.string().describe("Specific legal compliance issues or violations associated with the clause. If none, state 'None'.")
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

  Analyze the following legal document. For each clause that may put the user at a significant disadvantage, contain excessive obligations, or is potentially illegal, you must provide a detailed assessment.

  For each identified clause, provide:
  - The specific clause being assessed.
  - A risk level (Low, Medium, or High).
  - An explanation of the risk.
  - A 'complianceIssues' analysis: If the clause is illegal or non-compliant, you must specify the relevant law, regulation, or legal principle it violates and briefly explain the potential legal consequences (e.g., "Violates local tenancy laws regarding security deposits, could be unenforceable and lead to fines."). If there are no compliance issues, state 'None'.

  Document:
  {{documentText}}
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
