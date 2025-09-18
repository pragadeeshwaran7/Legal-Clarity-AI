'use server';

/**
 * @fileOverview An AI agent for comparing two legal documents.
 *
 * - compareDocuments - A function that handles the document comparison process.
 * - CompareDocumentsInput - The input type for the compareDocuments function.
 * - CompareDocumentsOutput - The return type for the compareDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareDocumentsInputSchema = z.object({
  document1: z.string().describe('The text content of the first legal document.'),
  document2: z.string().describe('The text content of the second legal document.'),
});
export type CompareDocumentsInput = z.infer<typeof CompareDocumentsInputSchema>;

const CompareDocumentsOutputSchema = z.object({
  comparison: z.string().describe('A detailed comparison of the two documents, highlighting similarities, differences, and potential conflicts.'),
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;

export async function compareDocuments(input: CompareDocumentsInput): Promise<CompareDocumentsOutput> {
  return compareDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareDocumentsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an AI legal assistant specializing in comparing legal documents.

  Analyze the two legal documents provided below. Generate a detailed comparison that covers the following points:
  1.  **Key Similarities**: Identify major clauses or terms that are similar in both documents.
  2.  **Significant Differences**: Point out important terms, obligations, or clauses that differ between the two.
  3.  **Potential Conflicts**: Highlight any areas where the two documents might contradict each other or lead to legal conflicts if both were in effect.
  4.  **Overall Assessment**: Provide a brief summary of how the documents relate to each other (e.g., one is an update of the other, they cover different aspects of an agreement, etc.).

  Structure your output clearly with headings for each section.

  **Document 1:**
  {{{document1}}}

  ---

  **Document 2:**
  {{{document2}}}
  `,
});

const compareDocumentsFlow = ai.defineFlow(
  {
    name: 'compareDocumentsFlow',
    inputSchema: CompareDocumentsInputSchema,
    outputSchema: CompareDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
