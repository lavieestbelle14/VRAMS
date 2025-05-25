
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OfficerNewApplicationDisabledPage() {
  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-6 w-6 text-primary" />
            New Application Submissions
          </CardTitle>
          <CardDescription>
            Guidance for Election Officers regarding new voter applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">
            New voter applications are submitted by applicants through the public-facing portal.
          </p>
          <p className="text-muted-foreground">
            As an officer, your role is to review, manage, and process the applications submitted by the public. You can view all submitted applications in the "All Applications" section of your dashboard.
          </p>
          <div className="mt-6">
            <Link href="/dashboard/applications" passHref>
              <Button>
                View All Applications
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
