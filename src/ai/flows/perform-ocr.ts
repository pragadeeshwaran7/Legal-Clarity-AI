'use server';

/**
 * @fileOverview An AI agent for performing OCR on a document image.
 *
 * - performOcr - A function that extracts text from an image.
 * - PerformOcrInput - The input type for the performOcr function.
 * - PerformOcrOutput - The return type for the performOcr function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PerformOcrInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a document page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PerformOcrInput = z.infer<typeof PerformOcrInputSchema>;

const PerformOcrOutputSchema = z.object({
  text: z.string().describe('The extracted text from the document image.'),
});
export type PerformOcrOutput = z.infer<typeof PerformOcrOutputSchema>;

export async function performOcr(input: PerformOcrInput): Promise<PerformOcrOutput> {
  return performOcrFlow(input);
}

const prompt = ai.definePrompt({
  name: 'performOcrPrompt',
  input: {schema: PerformOcrInputSchema},
  output: {schema: PerformOcrOutputSchema},
  prompt: `You are an Optical Character Recognition (OCR) expert. 
  
  Extract all text from the following document image. Maintain the original formatting as much as possible.
  
  Image: {{media url=imageDataUri}}`,
});

const performOcrFlow = ai.defineFlow(
  {
    name: 'performOcrFlow',
    inputSchema: PerformOcrInputSchema,
    outputSchema: PerformOcrOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
