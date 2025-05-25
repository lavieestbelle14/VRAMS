'use server';
/**
 * @fileOverview A flow that classifies the type of applicant based on the data entered in the application form.
 *
 * - classifyApplicantType - A function that handles the classification of the applicant type.
 * - ClassifyApplicantTypeInput - The input type for the classifyApplicantType function.
 * - ClassifyApplicantTypeOutput - The return type for the classifyApplicantType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyApplicantTypeInputSchema = z.object({
  personalInfo: z.string().describe('Personal information of the applicant.'),
  addressDetails: z.string().describe('Address details of the applicant.'),
  applicationType: z.string().describe('Type of application (e.g., Register, Transfer, Update).'),
  biometrics: z.string().describe('Biometric data of the applicant.'),
  civilDetails: z.string().describe('Civil details of the applicant (e.g., spouse, parents).'),
  specialSectorNeeds: z.string().optional().describe('Special sector needs of the applicant, if any.'),
});
export type ClassifyApplicantTypeInput = z.infer<typeof ClassifyApplicantTypeInputSchema>;

const ClassifyApplicantTypeOutputSchema = z.object({
  applicantType: z.string().describe('The classified type of the applicant (e.g., new registration, transfer, update).'),
  confidence: z.number().describe('The confidence level of the classification (0-1).'),
  reason: z.string().describe('Reasoning for the classification.'),
});
export type ClassifyApplicantTypeOutput = z.infer<typeof ClassifyApplicantTypeOutputSchema>;

export async function classifyApplicantType(input: ClassifyApplicantTypeInput): Promise<ClassifyApplicantTypeOutput> {
  return classifyApplicantTypeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyApplicantTypePrompt',
  input: {schema: ClassifyApplicantTypeInputSchema},
  output: {schema: ClassifyApplicantTypeOutputSchema},
  prompt: `You are an expert election officer specializing in classifying applicant types.

  Based on the following information provided in the application form, classify the applicant type into one of the following categories: new registration, transfer, or update.

  Provide a confidence level (0-1) for your classification and a brief reason for your classification.

  Personal Information: {{{personalInfo}}}
  Address Details: {{{addressDetails}}}
  Application Type: {{{applicationType}}}
  Biometrics: {{{biometrics}}}
  Civil Details: {{{civilDetails}}}
  Special Sector Needs: {{{specialSectorNeeds}}}
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const classifyApplicantTypeFlow = ai.defineFlow(
  {
    name: 'classifyApplicantTypeFlow',
    inputSchema: ClassifyApplicantTypeInputSchema,
    outputSchema: ClassifyApplicantTypeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
