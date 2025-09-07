
'use server';
/**
 * @fileOverview An AI flow that analyzes business data to generate actionable insights.
 *
 * - generateBusinessInsights - A function that analyzes sales/inventory data and provides recommendations.
 * - BusinessInsightInput - The input type for the function.
 * - BusinessInsightOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema: In a real app, this might just be the businessId to query data.
// For this demo, we'll pass simplified data structures directly.
const ProductDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  stock: z.number(),
  price: z.number(),
  category: z.string(),
});

const SalesDataSchema = z.object({
  itemName: z.string(),
  quantity: z.number(),
  totalPrice: z.number(),
});

const BusinessInsightInputSchema = z.object({
  products: z.array(ProductDataSchema).describe('List of all products in inventory.'),
  sales: z.array(SalesDataSchema).describe('List of all sales transaction line items from the last period.'),
});
export type BusinessInsightInput = z.infer<typeof BusinessInsightInputSchema>;

// Output Schema: This is where we structure the AI's response.
const InsightSchema = z.object({
    type: z.enum(['Restock Suggestion', 'Pricing Opportunity', 'Marketing Idea', 'Slow Mover Alert', 'Inventory Warning'])
      .describe('The category of the insight.'),
    title: z.string().describe('A short, catchy title for the insight card.'),
    finding: z.string().describe('A simple sentence stating the data-based observation.'),
    implication: z.string().describe('What the finding means for the business; the potential risk or opportunity.'),
    recommendation: z.string().describe('A concrete, actionable suggestion for the business owner.'),
    relatedProductId: z.string().optional().describe('The ID of the product this insight most relates to.'),
    suggestedAction: z.string().optional().describe('A short label for a call-to-action button (e.g., "View Product", "Create Discount").'),
    priority: z.enum(['High', 'Medium', 'Low']).describe('The priority level of this insight.'),
});

const BusinessInsightOutputSchema = z.object({
  insights: z.array(InsightSchema).describe('An array of actionable business insights.'),
});
export type BusinessInsightOutput = z.infer<typeof BusinessInsightOutputSchema>;


// The exported function that the UI will call
export async function generateBusinessInsights(input: BusinessInsightInput): Promise<BusinessInsightOutput> {
  return businessInsightsFlow(input);
}


// Define the Genkit Prompt
const prompt = ai.definePrompt({
  name: 'businessInsightsPrompt',
  input: { schema: BusinessInsightInputSchema },
  output: { schema: BusinessInsightOutputSchema },
  prompt: `You are "Zeneva AI", an expert business analyst for the Zeneva POS & Inventory management app for Nigerian SMEs. Your goal is to provide clear, actionable insights to help business owners grow.

Analyze the following JSON data which contains the user's current product inventory and recent sales data.

**Inventory Data:**
\`\`\`json
{{{json products}}}
\`\`\`

**Recent Sales Data:**
\`\`\`json
{{{json sales}}}
\`\`\`

Based on this data, identify key opportunities and risks. For each one, generate a concise insight. Focus on what a small business owner in Nigeria would find most valuable. Consider things like:
- Which products are selling fast and might need restocking? (Restock Suggestion)
- Are there any popular products with unusually high stock that could be promoted? (Marketing Idea)
- Are there any products with zero or very few sales? (Slow Mover Alert)
- Are there any items with good sales but very low profit margins compared to others? (Pricing Opportunity)

Your response must be in the structured JSON format defined by the output schema.
Generate between 3 and 5 high-quality insights.
Ensure your language is encouraging, clear, and directly helpful for a business owner.
`,
});


// Define the Genkit Flow
const businessInsightsFlow = ai.defineFlow(
  {
    name: 'businessInsightsFlow',
    inputSchema: BusinessInsightInputSchema,
    outputSchema: BusinessInsightOutputSchema,
  },
  async (input) => {
    // In a real application, you would fetch data from Firestore here based on a businessId
    // instead of receiving it directly in the input.
    // For now, the UI will provide the mock data.

    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate any insights.");
    }
    return output;
  }
);
