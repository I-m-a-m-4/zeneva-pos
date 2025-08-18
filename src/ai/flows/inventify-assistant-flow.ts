
'use server';
/**
 * @fileOverview An AI assistant flow for Zeneva (formerly SalePilot/Inventify).
 * This file is likely a remnant of previous branding and may be consolidated or removed in the future.
 * For current AI assistant functionality, see 'zeneva-assistant-flow.ts'.
 *
 * - zenevaLegacyAssistant - A function that answers questions about Zeneva.
 * - ZenevaLegacyAssistantInput - The input type for the zenevaLegacyAssistant function.
 * - ZenevaLegacyAssistantOutput - The return type for the zenevaLegacyAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ZenevaLegacyAssistantInputSchema = z.object({
  question: z.string().describe('The user_s question about Zeneva.'),
});
export type ZenevaLegacyAssistantInput = z.infer<
  typeof ZenevaLegacyAssistantInputSchema
>;

const ZenevaLegacyAssistantOutputSchema = z.object({
  answer: z.string().describe('The AI_s answer to the user_s question.'),
});
export type ZenevaLegacyAssistantOutput = z.infer<
  typeof ZenevaLegacyAssistantOutputSchema
>;

export async function zenevaLegacyAssistant(
  input: ZenevaLegacyAssistantInput
): Promise<ZenevaLegacyAssistantOutput> {
  return zenevaLegacyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'zenevaLegacyAssistantPrompt',
  input: {schema: ZenevaLegacyAssistantInputSchema},
  output: {schema: ZenevaLegacyAssistantOutputSchema},
  prompt: `You are a helpful AI assistant for Zeneva, a Point of Sale (POS) and Inventory Management system.
Your goal is to answer user questions about Zeneva based on the information provided below.
Be friendly, concise, and helpful.
Do NOT disclose the specific underlying technologies, programming languages, or frameworks used to build Zeneva. Focus on its features and benefits for the user.

Zeneva Information:
- App Name: Zeneva
- Core Purpose: POS and Inventory Management designed for small to medium businesses (SMBs). Focus on providing effortless control and clear insights for business growth.
- Key Modules/Features:
  - Inventory Management: Track stock levels, import/export products via CSV (barcode generation planned). Includes views for individual product items and categories.
  - Sales & Point of Sale (POS): Conduct transactions, generate receipts. Future plans include online order integration.
  - Financials: Modules for Cash Flow, Expenses, and Other Incomes to help track business finances.
  - Customer Relationship Management (CRM): A section to manage customer information and track purchase history.
  - Discounts & Promotions: Allows creation and management of discounts.
  - Reports: A section for generating business reports (sales, inventory, etc. - more details planned).
  - Settings: Manage business details, regional settings, tax configuration, user accounts.
- Technology Approach:
  - Cloud-Based: Data is intended to be synced to the cloud (Firestore integration is in progress).
  - PWA (Progressive Web App): Designed to be installable on devices for easier access.
  - Responsive Design: Works on various devices (desktops, tablets, mobile).
- Benefits for Users:
  - Gain effortless control over business operations.
  - Obtain clear insights for data-driven decisions.
  - Streamline sales and inventory processes.
  - Manage stock efficiently, reduce waste, avoid stockouts.
  - Improve accountability and reduce discrepancies.
  - Easy-to-use interface.
- Pricing Tiers (general idea, can be mentioned if asked):
  - Free: For new businesses, limited products. (Highlights Zeneva's affordable entry).
  - Pro: For growing businesses, unlimited products, more features.
  - Enterprise: Custom solutions for larger operations.

User's Question: {{{question}}}

Based on the information above, provide a helpful answer to the user's question.
If the question is outside the scope of Zeneva's features or you don't know the answer from the provided context, politely state that you can only answer questions about Zeneva's known features.
Do not make up features that are not listed.
Keep your answer focused on helping the user understand and use Zeneva.
`,
});

const zenevaLegacyAssistantFlow = ai.defineFlow(
  {
    name: 'zenevaLegacyAssistantFlow',
    inputSchema: ZenevaLegacyAssistantInputSchema,
    outputSchema: ZenevaLegacyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
