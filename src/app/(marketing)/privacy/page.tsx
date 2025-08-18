
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Privacy Policy | Zeneva',
  description: 'Learn how Zeneva collects, uses, and protects your business and personal data. Your privacy and security are our top priorities.',
};

export default function PrivacyPage() {
  const lastUpdated = "July 29, 2024";

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gradient-primary-accent">Privacy Policy</h1>
        <p className="text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Introduction</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
            <p>
                Welcome to Zeneva ("we", "our", "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our software-as-a-service platform (the "Service").
            </p>
            <p className="p-4 border-l-4 border-destructive/50 bg-destructive/10 text-destructive/80 rounded-md !my-6">
                <strong>Disclaimer:</strong> This is a template and not legal advice. You must consult with a legal professional to ensure this policy is complete and compliant with all applicable laws, such as the Nigeria Data Protection Regulation (NDPR).
            </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
            <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
            <ul>
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register for the Service.</li>
                <li><strong>Business Data:</strong> Information you upload or create within the Service, including but not limited to product details, inventory levels, sales transaction records, and customer information. This data is owned by you.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, browser type, and operating system.</li>
                 <li><strong>Financial Data:</strong> We do not store your full payment card details. All payments are processed through our secure payment processor, Paystack. We may store data related to payment transactions, such as the last four digits of your card and transaction history.</li>
            </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Use of Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
           <p>
               Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
           </p>
           <ul>
                <li>Create and manage your account.</li>
                <li>Process transactions and manage your business data as directed by you.</li>
                <li>Email you regarding your account or order.</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Service.</li>
                <li>Provide you with customer support and respond to your inquiries.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                <li>Notify you of updates to the Service.</li>
           </ul>
            <p><strong>We will never sell your Personal or Business Data to third parties.</strong></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Security of Your Information</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
           <p>
                We use administrative, technical, and physical security measures to help protect your personal and business information. We leverage secure cloud infrastructure (Firebase) and data encryption to safeguard your data. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
           </p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>4. Your Data Protection Rights</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
           <p>
               Depending on your location, you may have the following rights regarding your personal data:
           </p>
           <ul>
               <li>The right to access – You have the right to request copies of your personal data.</li>
               <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate or complete information you believe is incomplete.</li>
               <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
           </ul>
           <p>To exercise these rights, please contact us using the contact information provided below.</p>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle>5. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
           <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
           </p>
           <p>
               Zeneva Solutions<br/>
               Email: <a href="mailto:privacy@zeneva.app" className="text-primary hover:underline">privacy@zeneva.app</a>
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
