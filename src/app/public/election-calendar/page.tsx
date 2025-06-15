import { Calendar, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ElectionCalendarPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-2xl">
            <Calendar className="mr-2 h-6 w-6" />
            Election Calendar
        </CardTitle>
          <Button variant="outline" className="bg-white hover:bg-yellow-400" asChild>
            <Link href="/public/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upcoming Elections</h2>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">Barangay Elections</h3>
                <p className="text-muted-foreground">December 1, 2025</p>
                <p className="text-sm mt-2">Registration deadline: July 1 to 11, 2025</p>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-medium">National Elections</h3>
                <p className="text-muted-foreground">May 12, 2025</p>
                <p className="text-sm mt-2">Registration deadline: September 30, 2024</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}