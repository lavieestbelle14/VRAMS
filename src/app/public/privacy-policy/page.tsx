
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicyPage() {
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
          <CardTitle className="text-3xl">Privacy Policy</CardTitle>
          <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-foreground/90">
          <div>
            <h2 className="font-semibold text-xl mb-2">1. Introduction</h2>
            <p>The Voter Registration and Application Management System (VRAMS) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">2. Collection of Your Information</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect via the Service includes:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service. (This is a typical clause, adapt as necessary for VRAMS's actual data collection).</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">3. Use of Your Information</h2>
            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
             <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>Create and manage your account.</li>
              <li>Process your voter registration application and transactions.</li>
              <li>Email you regarding your account or application.</li>
              <li>Increase the efficiency and operation of the Service.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              <li>Notify you of updates to the Service.</li>
              <li>Comply with legal and regulatory requirements.</li>
            </ul>
          </div>
           <div>
            <h2 className="font-semibold text-xl mb-2">4. Disclosure of Your Information</h2>
            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
              <li><strong>Government Authorities:</strong> Your information will be shared with relevant government authorities (e.g., COMELEC) as necessary for the voter registration process and other electoral purposes.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">5. Security of Your Information</h2>
            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">6. Policy for Children</h2>
            <p>We do not knowingly solicit information from or market to children under the age of 18 (or the applicable voting age). If you become aware of any data we have collected from children under the applicable voting age, please contact us using the contact information provided below.</p>
          </div>
           <div>
            <h2 className="font-semibold text-xl mb-2">7. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
          </div>
          <div>
            <h2 className="font-semibold text-xl mb-2">8. Contact Us</h2>
            <p>If you have questions or comments about this Privacy Policy, please contact us through the appropriate government channels for VRAMS support.</p>
            <p className="mt-4 text-sm text-muted-foreground"><em>This is placeholder content. In a real application, this page would contain the official Privacy Policy for the VRAMS platform, compliant with relevant data privacy laws like the Data Privacy Act of 2012 (RA 10173) in the Philippines.</em></p>
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
