'use server';

/**
 * @fileOverview An AI agent for answering questions about a document.
 *
 * - answerDocumentQuestions - A function that handles the question answering process.
 * - AnswerDocumentQuestionsInput - The input type for the answerDocumentQuestions function.
 * - AnswerDocumentQuestionsOutput - The return type for the answerDocumentQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerDocumentQuestionsInputSchema = z.object({
  documentText: z.string().describe('The text content of the document.'),
  question: z.string().describe('The question to be answered about the document.'),
});
export type AnswerDocumentQuestionsInput = z.infer<
  typeof AnswerDocumentQuestionsInputSchema
>;

const AnswerDocumentQuestionsOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the document.'),
});
export type AnswerDocumentQuestionsOutput = z.infer<
  typeof AnswerDocumentQuestionsOutputSchema
>;

export async function answerDocumentQuestions(
  input: AnswerDocumentQuestionsInput
): Promise<AnswerDocumentQuestionsOutput> {
  return answerDocumentQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerDocumentQuestionsPrompt',
  input: {schema: AnswerDocumentQuestionsInputSchema},
  output: {schema: AnswerDocumentQuestionsOutputSchema},
  prompt: `You are an expert legal assistant. Please answer the following question about the document provided.\n\nDocument:\n{{{documentText}}}\n\nQuestion:\n{{{question}}}\n\nAnswer:`,
});

const answerDocumentQuestionsFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionsFlow',
    inputSchema: AnswerDocumentQuestionsInputSchema,
    outputSchema: AnswerDocumentQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
