
import type { InventoryItem, Receipt, Alert, SaleItem, UserStaff, Customer, WaitlistItem, SubscriptionTier, BusinessInstance, ActivationCode, BusinessSettings, BlogPost, Comment } from '@/types';


export const getInventoryItemById = (id: string): InventoryItem | undefined => {
  // This function would fetch from a database in a real app
  return undefined;
};

export const getReceiptById = (id: string): Receipt | undefined => {
    // This function would fetch from a database in a real app
  return undefined;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "mastering-inventory-management-for-smes",
    title: "5 Inventory Management Mistakes Costing SMEs Money",
    description: "Discover the common pitfalls in stock management and learn how a smart POS system like Zeneva can save you time, reduce waste, and boost profits.",
    author: "Jane Smith",
    date: "2024-07-25T09:00:00Z",
    category: "Inventory Management",
    imageUrl: "https://images.unsplash.com/photo-1586452327362-d3b73c456a0d?q=80&w=1200&auto=format&fit=crop",
    dataAiHint: "inventory management small business",
    isFeatured: true,
    likes: 125,
    comments: [
        { id: "comment-1", author: "Tunde", content: "Great insights! Number 2 is a big problem for my shop.", date: "2024-07-26T10:00:00Z", avatarUrl: "https://i.pravatar.cc/40?u=Tunde" },
        { id: "comment-2", author: "Aisha", content: "Very helpful article, thank you for sharing.", date: "2024-07-27T11:30:00Z", avatarUrl: "https://i.pravatar.cc/40?u=Aisha" },
    ],
    content: `
      <p>Managing inventory effectively is the backbone of any successful retail or wholesale business. In a fast-paced market, even small mistakes can lead to significant losses. Are you making any of these common errors? Let's explore them and see how Zeneva provides a solution.</p>
      
      <h3 class="font-bold text-xl mt-6 mb-2">1. Inaccurate Stock Counts (Ghost Inventory)</h3>
      <p>This is when your records say you have an item, but it's nowhere to be found. It leads to disappointed customers and lost sales. Manual tracking is often the culprit.</p>
      <p><strong>Zeneva's Solution:</strong> With our integrated POS, every sale automatically updates your stock levels in real-time. What you see in your dashboard is what you have on your shelf. This accuracy is crucial for reliability.</p>

      <h3 class="font-bold text-xl mt-6 mb-2">2. Not Knowing Your Best (and Worst) Sellers</h3>
      <p>Without clear data, you might be overstocking slow-moving items while running out of your most popular products. This ties up your capital and wastes valuable shelf space.</p>
      <p><strong>Zeneva's Solution:</strong> Our sales reports instantly show you which products are flying off the shelves and which are gathering dust. This allows you to make data-driven purchasing decisions, optimizing your inventory for maximum profitability.</p>

      <h3 class="font-bold text-xl mt-6 mb-2">3. Ignoring Seasonality and Trends</h3>
      <p>Demand for certain products can change with seasons, holidays, or market trends. Failing to anticipate these shifts can lead to missed opportunities or excess stock after the peak period has passed.</p>
      <p><strong>Zeneva's Solution:</strong> By analyzing your sales history in Zeneva, you can spot patterns and forecast future demand more accurately. Plan your inventory for festive seasons and be prepared for what your customers will want.</p>
    `,
  },
  {
    slug: "boosting-sales-with-data",
    title: "How to Use Sales Data to Make Smarter Business Decisions",
    description: "Your sales data is a goldmine. We'll show you how to use the reports in Zeneva to identify trends, understand customers, and increase your revenue.",
    author: "John Doe",
    date: "2024-07-18T11:00:00Z",
    category: "Sales & Growth",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    dataAiHint: "sales data analytics chart",
    likes: 98,
    comments: [],
    content: `
      <p>Every sale you make is more than just a transaction; it's a piece of data that can help you grow your business. But how do you turn raw numbers into actionable insights? Zeneva's reporting tools are designed to make this easy.</p>
      
      <h3 class="font-bold text-xl mt-6 mb-2">Identify Your Peak Hours and Days</h3>
      <p>Are you busiest on Saturday afternoons or Monday mornings? Knowing your peak periods helps you schedule staff more effectively and run targeted promotions when they'll have the most impact.</p>
      <p><strong>With Zeneva:</strong> Our sales reports can be filtered by date and time, giving you a clear picture of your business's rhythm.</p>
    `,
  },
  {
    slug: "why-your-sme-needs-a-pos",
    title: "Beyond the Cash Box: Why Every SME Needs a POS System",
    description: "Move beyond manual sales records. A modern POS system like Zeneva isn't a luxury; it's a vital tool for security, efficiency, and growth.",
    author: "David Brown",
    date: "2024-07-10T14:00:00Z",
    category: "Business Tips",
    imageUrl: "https://images.unsplash.com/photo-1556742212-5b321f3c261b?q=80&w=1200&auto=format&fit=crop",
    dataAiHint: "cash register POS system",
    likes: 210,
    comments: [],
    content: `
      <p>In today's competitive market, efficiency is key. A Point of Sale (POS) system does much more than just process payments. It's the central hub of your retail operation.</p>
      <h3 class="font-bold text-xl mt-6 mb-2">Improved Accuracy and Security</h3>
      <p>Manual calculations can lead to costly errors. A POS system automates pricing, tax, and discounts, ensuring every transaction is accurate. It also provides a digital trail, which significantly reduces the risk of employee theft or fraud.</p>
    `,
  },
  {
    slug: "customer-loyalty-strategies",
    title: "Simple Customer Loyalty Strategies for Your Business",
    description: "Learn effective ways to keep your customers coming back. From simple thank-yous to implementing a points system with Zeneva's CRM.",
    author: "Jane Smith",
    date: "2024-06-28T09:00:00Z",
    category: "Marketing",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop",
    dataAiHint: "customer loyalty rewards program gift",
    likes: 152,
    comments: [],
    content: `
      <p>Attracting a new customer can cost five times more than retaining an existing one. That's why building customer loyalty is one of the smartest investments you can make in your business.</p>
      <h3 class="font-bold text-xl mt-6 mb-2">Start with Excellent Service</h3>
      <p>The foundation of loyalty is a positive customer experience. Ensure your staff are friendly, helpful, and knowledgeable about your products. A simple, hassle-free checkout process, like the one Zeneva provides, also makes a big difference.</p>
    `,
  },
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};


export const mockSubscriptionTiers: SubscriptionTier[] = [
  { 
    id: "free", 
    name: "Free Tier", 
    priceMonthly: 0, 
    productLimit: 50, 
    userLimit: 1, 
    features: ["Basic Inventory", "POS Lite", "Limited Reports"],
    cta: "Get Started Free",
    href: "/checkout?plan=free",
  },
  { 
    id: "pro", 
    name: "Pro Plan", 
    priceMonthly: 7500, 
    priceYearly: 75000, 
    productLimit: 'unlimited', 
    userLimit: 5, 
    features: ["All Free Features", "Advanced Inventory", "Full POS", "CRM", "Detailed Analytics", "Basic Business Insights"],
    cta: "Choose Pro",
    href: "/checkout?plan=pro",
    popular: true,
    gradient: "from-primary to-accent",
  },
  {
    id: "lifetime",
    name: "Lifetime Deal",
    priceLifetime: 250000, 
    productLimit: 'unlimited',
    userLimit: 10,
    features: ["All Pro Features", "Lifetime Updates", "Priority Support for 1 Year", "Advanced Business & Competitor Insights (Coming Soon)"],
    cta: "Get Lifetime Access",
    href: "/checkout?plan=lifetime", 
    popular: false,
    gradient: "from-yellow-400 via-amber-500 to-orange-600",
  },
  { 
    id: "enterprise", 
    name: "Enterprise Solution", 
    productLimit: 'unlimited', 
    userLimit: 'unlimited', 
    features: ["All Pro Features", "Custom Integrations", "API Access", "Dedicated Support", "SLA", "Custom Feature Development"],
    cta: "Contact Sales",
    href: "/contact", 
  },
];
