
'use client';
import { ApplicationFormFields } from '@/components/dashboard/ApplicationFormFields';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicNewApplicationPage() {
  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold tracking-tight">Voter Registration Application</CardTitle>
          <CardDescription className="text-muted-foreground">
            Please fill out all required fields accurately. Ensure your information matches official documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationFormFields />
        </CardContent>
      </Card>
    </div>
  );
}
