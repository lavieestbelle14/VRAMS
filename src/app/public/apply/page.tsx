'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationFormFields } from '@/components/applications/ApplicationFormFields'; // Updated import path
import { ArrowLeft, FilePlus2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicNewApplicationPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">New Voter Application</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg rounded-lg border">
  <CardContent className="p-6">
    <ApplicationFormFields />
  </CardContent>
</Card>
    </div>
  );
}

