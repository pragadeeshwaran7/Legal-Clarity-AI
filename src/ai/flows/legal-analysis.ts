
'use server';
/**
 * @fileOverview A consolidated AI agent for all legal document analysis tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import wav from 'wav';

// Define the schema for a single detailed risk.
const DetailedRiskSchema = z.object({
  clause: z.string().describe('The specific clause being assessed.'),
  riskLevel: z.enum(['Low', 'Medium', 'High']).describe('The risk level of the clause (Low, Medium, or High).'),
  explanation: z.string().describe('An explanation of why the clause is considered risky.'),
  complianceIssues: z.string().describe("Specific legal compliance issues or violations associated with the clause. If none, state 'None'.")
});


// 1. Analyze Legal Document
const AnalyzeLegalDocumentInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the legal document to be analyzed.'),
});
export type AnalyzeLegalDocumentInput = z.infer<typeof AnalyzeLegalDocumentInputSchema>;

const AnalyzeLegalDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the legal document.'),
  riskAssessment: z.string().describe('A general assessment of potential risks in the document.'),
  keyClauses: z.string().describe('Explanations of the key clauses in the document.'),
  complianceAnalysis: z.string().describe('An analysis of the document\'s compliance with relevant laws and regulations, including potential legal consequences for non-compliance.'),
  detailedRisks: z.array(DetailedRiskSchema).describe('An array of risk assessments for each clause in the document.'),
});
export type AnalyzeLegalDocumentOutput = z.infer<typeof AnalyzeLegalDocumentOutputSchema>;

export async function analyzeLegalDocument(input: AnalyzeLegalDocumentInput): Promise<AnalyzeLegalDocumentOutput> {
  return analyzeLegalDocumentFlow(input);
}

const analyzeLegalDocumentPrompt = ai.definePrompt({
  name: 'analyzeLegalDocumentPrompt',
  input: {schema: AnalyzeLegalDocumentInputSchema},
  output: {schema: AnalyzeLegalDocumentOutputSchema},
  prompt: `You are an AI legal assistant specializing in analyzing legal documents. Your analysis must be thorough and include legal compliance checks.

  Analyze the following legal document and provide:
  1.  **Summary**: A concise summary of the document.
  2.  **General Risk Assessment**: A general overview of the potential risks.
  3.  **Key Clauses**: Explanations of the most important clauses.
  4.  **Compliance Analysis**: A detailed compliance analysis. If the document or any of its clauses are found to be potentially illegal or non-compliant, you must specify the relevant laws, regulations, or legal principles that are being violated and explain the a potential legal consequences (e.g., fines, unenforceability).
  5.  **Detailed Clause Analysis**: For every clause in the document, you must assess it. If a clause may put the user at a disadvantage, contains excessive obligations, or is potentially illegal, you must identify it and provide the following details:
      - The exact clause text.
      - A risk level (Low, Medium, or High).
      - A clear explanation of the risk.
      - Any specific legal compliance issues, citing relevant laws if possible. If there are no compliance issues, state 'None'.
      If a clause has no risk, do not include it in the final array.

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
    const {output} = await analyzeLegalDocumentPrompt(input);
    return output!;
  }
);


// 2. Suggest Amendment
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

const suggestAmendmentPrompt = ai.definePrompt({
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
    const {output} = await suggestAmendmentPrompt(input);
    return output!;
  }
);


// 3. Text to Speech
async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      let bufs = [] as any[];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });

      writer.write(pcmData);
      writer.end();
    });
}

const getSpeechFlow = ai.defineFlow(
    {
      name: 'getSpeechFlow',
      inputSchema: z.string(),
      outputSchema: z.object({ media: z.string() }),
    },
    async (text) => {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
        },
        prompt: text,
      });
      if (!media) {
        throw new Error('no media returned');
      }
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      return {
        media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
      };
    }
);

export async function getSpeech(text: string) {
    return getSpeechFlow(text);
}


// 4. Chat with Document
const ChatInputSchema = z.object({
    documentText: z.string().describe("The full text of the legal document."),
    question: z.string().describe("The user's question about the document.")
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
    answer: z.string().describe("The AI's answer to the user's question, citing specific laws or IPC sections if applicable.")
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chatWithDocument(input: ChatInput): Promise<ChatOutput> {
    return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are a legal chatbot. You will answer questions about the provided legal document. When answering, if the question involves legal compliance, liability, or penalties, you must cite relevant laws or sections of the Indian Penal Code (IPC) where applicable.

Document Text:
{{{documentText}}}

User's Question:
"{{{question}}}"

Provide a clear and concise answer based on the document text and relevant legal frameworks.
`
});

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: ChatInputSchema,
        outputSchema: ChatOutputSchema
    },
    async (input) => {
        const { output } = await chatPrompt(input);
        return output!;
    }
);


// 5. Simplify Text
const SimplifyTextInputSchema = z.object({
    text: z.string().describe("A piece of legal text to be simplified."),
});
export type SimplifyTextInput = z.infer<typeof SimplifyTextInputSchema>;

const SimplifyTextOutputSchema = z.object({
    simplifiedText: z.string().describe("The simplified, easy-to-understand version of the text.")
});
export type SimplifyTextOutput = z.infer<typeof SimplifyTextOutputSchema>;

export async function simplifyText(input: SimplifyTextInput): Promise<SimplifyTextOutput> {
    return simplifyTextFlow(input);
}

const simplifyTextPrompt = ai.definePrompt({
    name: 'simplifyTextPrompt',
    input: { schema: SimplifyTextInputSchema },
    output: { schema: SimplifyTextOutputSchema },
    prompt: `You are an AI assistant that simplifies complex legal text into plain English. Do not change the meaning of the text, but make it easy for a non-lawyer to understand.

Original Text:
"{{{text}}}"

Rewrite the text in simple, clear language.
`
});

const simplifyTextFlow = ai.defineFlow({
    name: 'simplifyTextFlow',
    inputSchema: SimplifyTextInputSchema,
    outputSchema: SimplifyTextOutputSchema
}, async (input) => {
    const { output } = await simplifyTextPrompt(input);
    return output!;
});
