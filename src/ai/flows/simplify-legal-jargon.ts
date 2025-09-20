'use server';

/**
 * @fileOverview A legal jargon simplification AI agent.
 *
 * - simplifyLegalJargon - A function that simplifies legal jargon into plain language.
 * - SimplifyLegalJargonInput - The input type for the simplifyLegalJargon function.
 * - SimplifyLegalJargonOutput - The return type for the simplifyLegalJargon function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyLegalJargonInputSchema = z.object({
  legalText: z.string().describe('The legal text to simplify.'),
});
export type SimplifyLegalJargonInput = z.infer<typeof SimplifyLegalJargonInputSchema>;

const SimplifyLegalJargonOutputSchema = z.object({
  plainLanguageText: z.string().describe('The simplified plain language text.'),
});
export type SimplifyLegalJargonOutput = z.infer<typeof SimplifyLegalJargonOutputSchema>;

export async function simplifyLegalJargon(input: SimplifyLegalJargonInput): Promise<SimplifyLegalJargonOutput> {
  return simplifyLegalJargonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyLegalJargonPrompt',
  input: {schema: SimplifyLegalJargonInputSchema},
  output: {schema: SimplifyLegalJargonOutputSchema},
  prompt: `You are an expert legal professional skilled at explaining complex legal jargon in plain, easy-to-understand language.

  Simplify the following legal text so that an average person can understand it. 

  IMPORTANT: While simplifying, if you identify any clause that appears to be illegal, non-compliant, or unusually harsh, you must add a clear and bolded warning (e.g., **WARNING: This clause may be legally unenforceable...**) within your simplified explanation for that section, briefly stating the potential issue.

  Legal Text:
  {{{legalText}}}
  `,
});

const simplifyLegalJargonFlow = ai.defineFlow(
  {
    name: 'simplifyLegalJargonFlow',
    inputSchema: SimplifyLegalJargonInputSchema,
    outputSchema: SimplifyLegalJargonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
