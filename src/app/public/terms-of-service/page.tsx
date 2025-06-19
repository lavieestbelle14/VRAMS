
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TermsOfServicePage() {
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
        <h1 className="text-4xl font-bold text-primary">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Voter Registration and Application Management System</p>
      </div>
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Our Terms of Service</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Please read these terms of service carefully before using Our Service.
          </p>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to eRehistroPh (Voter Registration and Application Management System). By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
          </p>
          <h2 className="text-xl font-semibold">2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) on eRehistroPh's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>modify or copy the materials;</li>
            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
            <li>attempt to decompile or reverse engineer any software contained on eRehistroPh's website;</li>
            <li>remove any copyright or other proprietary notations from the materials; or</li>
            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
          </ul>
          <p>
            This license shall automatically terminate if you violate any of these restrictions and may be terminated by eRehistroPh at any time.
          </p>
          <h2 className="text-xl font-semibold">3. Disclaimer</h2>
          <p>
            The materials on eRehistroPh's website are provided on an 'as is' basis. eRehistroPh makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
          <h2 className="text-xl font-semibold">4. Limitations</h2>
          <p>
            In no event shall eRehistroPh or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on eRehistroPh's website, even if eRehistroPh or a eRehistroPh authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
          <h2 className="text-xl font-semibold">5. Modifications</h2>
          <p>
            eRehistroPh may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
          <h2 className="text-xl font-semibold">6. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the Philippines and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
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
