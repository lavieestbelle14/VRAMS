
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const router = useRouter();
  const logoSrc = "/vrams_logo.png"; // Ensure this path is correct

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 pt-12">
      <div className="mb-8 text-center">
        <Link href="/">
          <Image
            src={logoSrc}
            alt="VRAMS official seal"
            width={64}
            height={64}
            data-ai-hint="VRAMS official seal"
            className="mx-auto cursor-pointer"
          />
        </Link>
        <h1 className="text-4xl font-bold text-primary mt-4">VRAMS Portal</h1>
      </div>
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Terms of Service</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <div>
            <h2 className="font-semibold text-xl mb-2">1. Introduction</h2>
            <p>Welcome to the Voter Registration and Application Management System (VRAMS). These Terms of Service ("Terms") govern your access to and use of the VRAMS platform and its related services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">2. Use of the Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You are responsible for ensuring that all information you provide to the Service is accurate, current, and complete. You agree not to use the Service:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>In any way that violates any applicable national or local law or regulation.</li>
              <li>To impersonate or attempt to impersonate VRAMS, a VRAMS employee, another user, or any other person or entity.</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Service, or which, as determined by us, may harm VRAMS or users of the Service or expose them to liability.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">3. Account Registration and Security</h2>
            <p>To access certain features of the Service, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify VRAMS immediately of any unauthorized use of your account or any other breach of security.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">4. Intellectual Property</h2>
            <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of the administering body of VRAMS and its licensors. The Service is protected by copyright, trademark, and other laws of the Philippines.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">5. Disclaimer of Warranties</h2>
            <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. VRAMS makes no representations or warranties of any kind, express or implied, as to the operation of their services, or the information, content, or materials included therein. You expressly agree that your use of these services, their content, and any services or items obtained from us is at your sole risk.</p>
          </div>
           <div>
            <h2 className="font-semibold text-xl mb-2">6. Limitation of Liability</h2>
            <p>In no event will VRAMS, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">7. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">8. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us through the appropriate government channels for VRAMS support.</p>
            <p className="mt-4 text-sm text-muted-foreground"><em>This is placeholder content. In a real application, this page would contain the official Terms of Service for the VRAMS platform.</em></p>
          </div>
          <div className="mt-8 flex justify-end">
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
