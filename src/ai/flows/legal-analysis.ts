'use server';
/**
 * @fileOverview A consolidated AI agent for all legal document analysis tasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

// 1. Analyze Legal Document
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

const analyzeLegalDocumentPrompt = ai.definePrompt({
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
    const {output} = await analyzeLegalDocumentPrompt(input);
    return output!;
  }
);


// 2. Assess Document Risk
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

// 3. Answer Document Questions
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

const answerDocumentQuestionsPrompt = ai.definePrompt({
  name: 'answerDocumentQuestionsPrompt',
  input: {schema: AnswerDocumentQuestionsInputSchema},
  output: {schema: AnswerDocumentQuestionsOutputSchema},
  prompt: `You are an expert legal assistant with extensive experience in legal cases, compliance, and regulations. Please answer the following question about the document provided. 

If the question touches upon the legality or compliance of a clause, you must provide detailed information, citing relevant laws, sections (e.g., IPC sections), or legal principles. Explain the potential legal consequences of any non-compliant or illegal clauses related to the question.

Document:
{{{documentText}}}

Question:
{{{question}}}

Answer:`,
});

const answerDocumentQuestionsFlow = ai.defineFlow(
  {
    name: 'answerDocumentQuestionsFlow',
    inputSchema: AnswerDocumentQuestionsInputSchema,
    outputSchema: AnswerDocumentQuestionsOutputSchema,
  },
  async input => {
    const {output} = await answerDocumentQuestionsPrompt(input);
    return output!;
  }
);


// 4. Simplify Legal Jargon
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

const simplifyLegalJargonPrompt = ai.definePrompt({
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
    const {output} = await simplifyLegalJargonPrompt(input);
    return output!;
  }
);


// 5. Compare Documents
const CompareDocumentsInputSchema = z.object({
  document1: z.string().describe('The text content of the first legal document.'),
  document2: z.string().describe('The text content of the second legal document.'),
});
export type CompareDocumentsInput = z.infer<typeof CompareDocumentsInputSchema>;

const CompareDocumentsOutputSchema = z.object({
  comparison: z.string().describe('A detailed comparison of the two documents, highlighting similarities, differences, potential conflicts, and compliance issues.'),
});
export type CompareDocumentsOutput = z.infer<typeof CompareDocumentsOutputSchema>;

export async function compareDocuments(input: CompareDocumentsInput): Promise<CompareDocumentsOutput> {
  return compareDocumentsFlow(input);
}

const compareDocumentsPrompt = ai.definePrompt({
  name: 'compareDocumentsPrompt',
  input: {schema: CompareDocumentsInputSchema},
  output: {schema: CompareDocumentsOutputSchema},
  prompt: `You are an AI legal assistant specializing in comparing legal documents.

  Analyze the two legal documents provided below. Generate a detailed comparison that covers the following points:
  1.  **Key Similarities**: Identify major clauses or terms that are similar in both documents.
  2.  **Significant Differences**: Point out important terms, obligations, or clauses that differ between the two.
  3.  **Potential Conflicts**: Highlight any areas where the two documents might contradict each other or lead to legal conflicts if both were in effect.
  4.  **Legal Compliance**: Analyze the legality of both documents. Point out any potentially illegal or non-compliant clauses in either document, specifying the potential legal issues and which document is more compliant.
  5.  **Overall Assessment**: Provide a brief summary of how the documents relate to each other (e.g., one is an update of the other, they cover different aspects of an agreement, etc.).

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
    const {output} = await compareDocumentsPrompt(input);
    return output!;
  }
);


// 6. Suggest Amendment
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


// 7. Generate Audio Summary
const GenerateAudioSummaryInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type GenerateAudioSummaryInput = z.infer<typeof GenerateAudioSummaryInputSchema>;

const GenerateAudioSummaryOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe('The generated audio as a data URI in WAV format.'),
});
export type GenerateAudioSummaryOutput = z.infer<typeof GenerateAudioSummaryOutputSchema>;

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

export async function generateAudioSummary(
  input: GenerateAudioSummaryInput
): Promise<GenerateAudioSummaryOutput> {
  return generateAudioSummaryFlow(input);
}

const generateAudioSummaryFlow = ai.defineFlow(
  {
    name: 'generateAudioSummaryFlow',
    inputSchema: GenerateAudioSummaryInputSchema,
    outputSchema: GenerateAudioSummaryOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: input.text,
    });

    if (!media) {
      throw new Error('No audio media was returned from the model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);


// 8. Perform OCR
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

const performOcrPrompt = ai.definePrompt({
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
    const {output} = await performOcrPrompt(input);
    return output!;
  }
);
