'use server';

/**
 * @fileOverview An AI agent for suggesting amendments to legal clauses.
 *
 * - suggestAmendment - A function that suggests a revised, more favorable version of a legal clause.
 * - SuggestAmendmentInput - The input type for the suggestAmendment function.
 * - SuggestAmendmentOutput - The return type for the suggestAmendment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAmendmentInputSchema = z.object({
  originalClause: z.string().describe('The original, risky legal clause.'),
  riskExplanation: z
    .string()
    .describe('The explanation of why the clause is considered risky.'),
});
export type SuggestAmendmentInput = z.infer<typeof SuggestAmendmentInputSchema>;

const SuggestAmendmentOutputSchema = z.object({
  suggestedAmendment: z
    .string()
    .describe('The AI-generated, revised clause that is more favorable to the user and legally compliant.'),
  explanation: z.string().describe('An explanation of how the new clause mitigates the original risk and improves legal compliance.'),
});
export type SuggestAmendmentOutput = z.infer<typeof SuggestAmendmentOutputSchema>;

export async function suggestAmendment(
  input: SuggestAmendmentInput
): Promise<SuggestAmendmentOutput> {
  return suggestAmendmentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAmendmentPrompt',
  input: {schema: SuggestAmendmentInputSchema},
  output: {schema: SuggestAmendmentOutputSchema},
  prompt: `You are an expert paralegal AI specializing in contract negotiation and revision. Your task is to rewrite a risky or illegal legal clause to be more fair, balanced, and legally compliant for the user.

Analyze the original clause and the associated risk. Then, generate a revised version of the clause that mitigates this risk and corrects any potential legal violations. Also, provide a brief explanation for why your suggested amendment is better, both for fairness and for legal compliance.

Original Clause:
"{{{originalClause}}}"

Identified Risk/Illegality:
"{{{riskExplanation}}}"

Rewrite the clause to protect the user's interests while ensuring it is legally sound and enforceable. Maintain a professional tone.
`,
});

const suggestAmendmentFlow = ai.defineFlow(
  {
    name: 'suggestAmendmentFlow',
    inputSchema: SuggestAmendmentInputSchema,
    outputSchema: SuggestAmendmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
