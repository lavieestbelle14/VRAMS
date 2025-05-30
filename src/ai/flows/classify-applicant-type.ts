
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
  personalInfo: z.string().describe('Personal information summary of the applicant, including name, DOB, sex, citizenship basis, and profession/occupation.'),
  addressDetails: z.string().describe('Current address details and residency period at current address.'),
  applicationType: z.string().describe('Type of application (e.g., register, transfer).'),
  biometrics: z.string().describe('Biometric data status of the applicant.'),
  civilDetails: z.string().describe('Civil details of the applicant (e.g., civil status, spouse).'),
  specialSectorNeeds: z.string().optional().describe('Special sector needs of the applicant, if any (e.g. PWD, illiterate, indigenous).'),
  previousAddressInfo: z.string().optional().describe('Information about the previous address, if application type is transfer.'),
});
export type ClassifyApplicantTypeInput = z.infer<typeof ClassifyApplicantTypeInputSchema>;

const ClassifyApplicantTypeOutputSchema = z.object({
  applicantType: z.string().describe('The classified type of the applicant (e.g., New Registration, Transfer of Registration).'),
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
  prompt: `You are an expert election officer specializing in classifying voter application types.

  Based on the following information provided in the application form, classify the applicant type into one of the following categories: 
  - New Registration
  - Transfer of Registration

  Provide a confidence level (0-1) for your classification and a brief reason for your classification.
  Consider all provided fields to make the most accurate classification. If "previousAddressInfo" is present, it strongly suggests a "Transfer". Otherwise, it's likely "New Registration".

  Application Type field from form: {{{applicationType}}}
  Personal Information: {{{personalInfo}}}
  Address Details: {{{addressDetails}}}
  Biometrics Data: {{{biometrics}}}
  Civil Details: {{{civilDetails}}}
  Special Sector Needs: {{{specialSectorNeeds}}}
  {{#if previousAddressInfo}}Previous Address Info (Transfer): {{{previousAddressInfo}}}{{/if}}
  `,
  config: {
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
    const result = await prompt(input);
    if (!result.output) {
      // Log the full result for debugging in case the output structure is unexpected
      console.error("Genkit prompt for classifyApplicantType did not return an output object. Full result:", JSON.stringify(result, null, 2));
      throw new Error("AI classification failed: No output from model. Please check console for details.");
    }
    return result.output;
  }
);

