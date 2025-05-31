
'use client';
import { ApplicationFormFields } from '@/components/dashboard/ApplicationFormFields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">New Voter Application</h1>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Voter Registration Application Form</CardTitle>
          <CardDescription>
            Please fill out all required fields accurately. Your information will be kept confidential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}
