'use client';
import { ApplicationFormFields } from '@/components/dashboard/ApplicationFormFields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewApplicationPage() {
  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">New Voter Application</h2>
          <p className="text-muted-foreground">
            Encode voter information for registration or transfer.
          </p>
        </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>Please fill in all required fields accurately.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}
