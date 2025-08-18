
'use server';
/**
 * @fileOverview An AI flow that analyzes inventory data to suggest improvements.
 *
 * - productTroubleshoot - A function that analyzes product data and provides troubleshooting suggestions.
 * - ProductTroubleshootInput - The input type for the function.
 * - ProductTroubleshootOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProductDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().optional(),
  stock: z.number(),
  price: z.number(),
  category: z.string().optional(),
  description: z.string().optional(),
});

const ProductTroubleshootInputSchema = z.object({
  products: z.array(ProductDataSchema).describe('List of all products in inventory.'),
});
export type ProductTroubleshootInput = z.infer<typeof ProductTroubleshootInputSchema>;

const SuggestionSchema = z.object({
    title: z.string().describe('A short, clear title for the suggestion (e.g., "Missing Prices", "Potential Duplicates").'),
    description: z.string().describe('A simple explanation of the issue and why it matters.'),
    affectedProductIds: z.array(z.string()).optional().describe('A list of product IDs that are affected by this issue.'),
});

const ProductTroubleshootOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('An array of actionable suggestions to improve data quality.'),
});
export type ProductTroubleshootOutput = z.infer<typeof ProductTroubleshootOutputSchema>;

export async function productTroubleshoot(input: ProductTroubleshootInput): Promise<ProductTroubleshootOutput> {
  return productTroubleshootFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productTroubleshootPrompt',
  input: { schema: ProductTroubleshootInputSchema },
  output: { schema: ProductTroubleshootOutputSchema },
  prompt: `You are an expert inventory data analyst for "Zeneva", a POS & Inventory management app for Nigerian SMEs. Your goal is to help business owners improve their data quality for better tracking and sales.

Analyze the following JSON data which contains the user's current product inventory.

**Inventory Data:**
\`\`\`json
{{{json products}}}
\`\`\`

Based on this data, identify data quality issues and improvement opportunities. For each issue you find, generate a suggestion. Focus on:
- **Missing or Invalid Data:** Products with a price of 0, no category, or very short/generic descriptions.
- **Potential Duplicates:** Products with very similar names but different SKUs. This might be correct (variants) or it might be a mistake. Your suggestion should advise the user to check them.
- **Merchandising Opportunities:** Products with good stock levels but weak descriptions that could be improved to help with online sales.
- **Stock Level Sanity Check:** Any items with unusually high stock that have no sales history (if sales data were present). For now, just focus on the data quality.

Your response must be in the structured JSON format defined by the output schema.
Generate between 2 and 4 high-quality suggestions.
`,
});

const productTroubleshootFlow = ai.defineFlow(
  {
    name: 'productTroubleshootFlow',
    inputSchema: ProductTroubleshootInputSchema,
    outputSchema: ProductTroubleshootOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate any troubleshooting suggestions.");
    }
    return output;
  }
);
