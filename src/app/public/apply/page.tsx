
'use client';
import { ApplicationFormFields } from '@/components/dashboard/ApplicationFormFields'; // Re-using the same form
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicNewApplicationPage() {
  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">New Voter Application</h2>
          <p className="text-muted-foreground">
            Fill out the form to register or transfer your voter registration.
          </p>
        </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>Please fill in all required fields accurately. Your application ID will be shown upon submission.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}
