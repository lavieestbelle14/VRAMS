
'use client';
import { ApplicationFormFields } from '@/components/dashboard/ApplicationFormFields'; // Note: Path might be for officer context, adjust if needed for public user if distinct component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FilePlus2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewApplicationPage() {
  const router = useRouter();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <FilePlus2 className="mr-3 h-8 w-8 text-primary" />
          New Voter Application
        </h2>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <p className="text-muted-foreground">
        Fill out the form below to apply for new voter registration or transfer of registration.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Voter Registration Application Form</CardTitle>
          <CardDescription>
            Please provide accurate and complete information. All fields marked with an asterisk (*) are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}
