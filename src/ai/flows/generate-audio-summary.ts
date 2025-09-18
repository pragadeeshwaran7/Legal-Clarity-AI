'use server';

/**
 * @fileOverview An AI agent for generating audio from text.
 *
 * - generateAudioSummary - A function that converts text to speech.
 * - GenerateAudioSummaryInput - The input type for the generateAudioSummary function.
 * - GenerateAudioSummaryOutput - The return type for the generateAudioSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

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
