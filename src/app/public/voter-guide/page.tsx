// app/public/voter-guide/page.tsx
import { ArrowLeft, ShieldCheck, BookOpen, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VoterGuidePage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-2xl">
            <ShieldCheck className="mr-2 h-6 w-6" />
            Voter's Guide
          </CardTitle>
          <Button variant="outline" className="bg-white hover:bg-yellow-400" asChild>
            <Link href="/public/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Voter Rights Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                Your Rights as a Voter
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium">Right to Vote</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    All registered Filipino citizens 18+ have the right to vote in elections.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium">Right to Secret Ballot</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your vote is confidential and cannot be revealed to anyone.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium">Right to Accessible Polling</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Polling places must be accessible to all voters, including PWDs.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="font-medium">Right to Assistance</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    You may request help from poll workers if needed.
                  </p>
                </div>
              </div>
            </section>

            {/* Voter Responsibilities Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Info className="mr-2 h-5 w-5 text-blue-500" />
                Your Responsibilities
              </h2>
              <ul className="space-y-3 list-disc pl-5">
                <li>Register before the deadline (at least 120 days before elections)</li>
                <li>Verify your registration status before election day</li>
                <li>Bring valid ID to the polling place</li>
                <li>Follow all election rules and regulations</li>
                <li>Respect the rights of other voters</li>
                <li>Report any election irregularities to authorities</li>
              </ul>
            </section>

            {/* Voting Process Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
                Voting Process
              </h2>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-800 pl-4">
                  <h3 className="font-medium">Before Election Day</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-sm mt-1">
                    <li>Check your registration status</li>
                    <li>Locate your polling precinct</li>
                    <li>Review the sample ballot</li>
                    <li>Prepare valid IDs</li>
                  </ol>
                </div>
                <div className="border-l-4 border-blue-800 pl-4">
                  <h3 className="font-medium">On Election Day</h3>
                  <ol className="list-decimal pl-5 space-y-1 text-sm mt-1">
                    <li>Go to your assigned precinct</li>
                    <li>Present your ID to the Board of Election Inspectors</li>
                    <li>Get your ballot and fill it out carefully</li>
                    <li>Feed your ballot into the Vote Counting Machine</li>
                    <li>Have your finger marked with indelible ink</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Common Violations Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
                Prohibited Acts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium">Vote Buying/Selling</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Offering or accepting money/goods for votes is illegal.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium">Campaigning Near Polls</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    No campaign materials within 30m of polling places.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium">Multiple Voting</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Voting more than once is a serious offense.
                  </p>
                </div>
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="font-medium">Disrupting Elections</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Causing disturbances at polling places is prohibited.
                  </p>
                </div>
              </div>
            </section>

            {/* Additional Resources */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Additional Resources</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link 
                    href="https://www.comelec.gov.ph" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    COMELEC Official Website
                  </Link>
                </Button>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}