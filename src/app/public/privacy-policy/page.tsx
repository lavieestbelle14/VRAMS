
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PrivacyPolicyPage() {
  const logoSrc = "/vrams_logo.png";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Image
            src={logoSrc}
            alt="VRAMS official seal"
            width={64}
            height={64}
            data-ai-hint="VRAMS official seal"
          />
        </div>
        <h1 className="text-4xl font-bold text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Voter Registration and Application Management System</p>
      </div>
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Commitment to Your Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your privacy is important to us. It is eRehistroPh's policy to respect your privacy regarding any information we may collect from you across our website.
          </p>
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>
            We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.
            The personal information that we collect includes, but is not limited to:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Name, date of birth, sex, place of birth, citizenship details.</li>
            <li>Contact information including email address and phone number.</li>
            <li>Address information for current and previous residences (if applicable).</li>
            <li>Civil status and family details.</li>
            <li>Information related to special needs or assistance required.</li>
            <li>Profession or occupation, and TIN (optional).</li>
          </ul>
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <p>
            We use the collected information for the primary purpose of processing your voter registration or application. This includes:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Verifying your identity and eligibility.</li>
            <li>Managing your application and communicating its status.</li>
            <li>Maintaining accurate voter registration records as mandated by law.</li>
            <li>Providing assistance for special needs, if requested.</li>
            <li>Internal record keeping and system administration.</li>
          </ul>
          <h2 className="text-xl font-semibold">3. Data Security</h2>
          <p>
            We are committed to ensuring that your information is secure. We retain collected information for as long as necessary to provide you with your requested service and as required by law. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.
          </p>
          <h2 className="text-xl font-semibold">4. Sharing of Information</h2>
          <p>
            We do not share any personally identifying information publicly or with third-parties, except when required to by law, or with relevant government agencies (e.g., COMELEC) for the purpose of voter registration and electoral processes.
          </p>
          <h2 className="text-xl font-semibold">5. Your Rights</h2>
          <p>
            You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services (e.g., voter registration). You have the right to access, correct, or request deletion of your personal information, subject to legal and contractual restrictions.
          </p>
           <h2 className="text-xl font-semibold">6. Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
          </p>
          <div className="pt-6 text-center">
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
