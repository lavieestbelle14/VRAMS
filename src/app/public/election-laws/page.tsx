import { ArrowLeft, BookOpen, ExternalLink } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ElectionLawsPage() {
return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center text-2xl">
            <BookOpen className="mr-2 h-6 w-6" />
            Election Laws & Resources
          </CardTitle>
          <Button 
            variant="outline" 
            className="bg-white hover:bg-yellow-400 transition-colors" 
            asChild
          >
            <Link href="/public/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Official Resources</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium flex items-center">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Senate Electoral Tribunal Election Laws
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Comprehensive collection of election laws and jurisprudence
                  </p>
                  <Button variant="link" className="pl-0 mt-2" asChild>
                    <Link 
                      href="https://www.set.gov.ph/resources/election-law/" 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit SET Website
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Key Local Election Laws</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Republic Act No. 8189</h3>
                  <p className="text-muted-foreground text-sm">
                    The Voter's Registration Act of 1996
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Republic Act No. 8436</h3>
                  <p className="text-muted-foreground text-sm">
                    The Automated Election System Law
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Republic Act No. 7166</h3>
                  <p className="text-muted-foreground text-sm">
                    Synchronized National and Local Elections Law
                  </p>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}