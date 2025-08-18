
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: 'Terms of Service | Zeneva',
  description: 'Read the terms and conditions for using the Zeneva POS and Inventory Management software.',
};

export default function TermsPage() {
    const lastUpdated = "July 29, 2024";

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4 space-y-8">
        <section className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4 text-gradient-primary-accent">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">Last updated: {lastUpdated}</p>
        </section>

        <Card>
            <CardHeader>
            <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
            <p>
                Welcome to Zeneva ("we", "our", "us"). These Terms of Service ("Terms") govern your use of our website and the Zeneva software-as-a-service platform (collectively, the "Service").
            </p>
            <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
            </p>
            <p className="p-4 border-l-4 border-destructive/50 bg-destructive/10 text-destructive/80 rounded-md !my-6">
                <strong>Disclaimer:</strong> This is a template and not legal advice. You must consult with a legal professional to create Terms of Service that are legally binding and appropriate for your business and jurisdiction.
            </p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
            <CardTitle>1. Accounts & Business Instances</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>
                    When you create an account with us, you guarantee that you are above the age of 18 and that the information you provide us is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on the Service.
                </p>
                <p>
                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                </p>
                <p>
                    The "admin" user of a business instance is solely responsible for managing staff access and their permissions within the Service.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>2. Subscriptions and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
            <p>
                Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
            </p>
            <p>
                A valid payment method is required to process the payment for your Subscription. You shall provide us with accurate and complete billing information. By submitting such payment information, you automatically authorize us to charge all Subscription fees incurred through your account to any such payment instruments.
            </p>
             <p>
                All fees are exclusive of all taxes, levies, or duties imposed by taxing authorities, and you shall be responsible for payment of all such taxes, levies, or duties.
            </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>3. Use of the Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>You agree not to use the Service for any unlawful purpose or in any way that interrupts, damages, or impairs the service. You are responsible for all data and information uploaded to your account (e.g., product information, sales data) and you guarantee that you have the right to use this data.</p>
                <p>Zeneva is not responsible for any loss of data. We recommend that you maintain regular backups of your critical business data.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>4. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                <p>Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>5. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>In no event shall Zeneva, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
             <CardTitle>6. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>
                    These Terms shall be governed and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions.
                </p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>7. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg dark:prose-invert max-w-full text-muted-foreground">
                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
            </CardContent>
        </Card>
        </div>
    );
}
