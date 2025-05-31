
'use client';
import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search as SearchIcon, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const faqItems = [
  {
    id: 'item-1',
    question: 'How do I register to vote?',
    answer:
      'You can register to vote by filling out the New Voter Application form available on this portal. Make sure you meet all the eligibility requirements and provide accurate information. After submission, you will need to complete your biometrics capture at a designated COMELEC office.',
  },
  {
    id: 'item-2',
    question: 'What are the eligibility requirements?',
    answer:
      'To be eligible to vote, you must be: (1) A Filipino citizen, (2) At least eighteen (18) years of age on or before election day, (3) A resident of the Philippines for at least one (1) year, and (4) A resident of the city or municipality where you intend to vote for at least six (6) months immediately preceding the election. Specific disqualifications under the law also apply.',
  },
  {
    id: 'item-3',
    question: 'How can I track my application status?',
    answer:
      'Use the "Track Application Status" page on this portal. You will need your Application ID, which is provided to you after successfully submitting your application.',
  },
  {
    id: 'item-4',
    question: 'What if I made a mistake in my application?',
    answer:
      'If your application has not yet been approved, you may be able to contact COMELEC for corrections. Once an application is processed, major changes might require a new application or specific correction procedures. It is best to double-check all information before submitting.',
  },
  {
    id: 'item-5',
    question: 'When and where do I complete my biometrics?',
    answer:
      'After your initial application is approved (status: "Approved - Awaiting Biometrics"), you will be prompted to schedule an appointment for biometrics capture. The "Track Application Status" page will provide a link to schedule your biometrics at a designated COMELEC office or satellite registration center.',
  },
  {
    id: 'item-6',
    question: 'What is a Voter ID and when do I get it?',
    answer:
      'Your Voter ID (also referred to as Voter Identification Number or VIN) is your unique identifier as a registered voter. It is generated once your application is fully approved, including successful biometrics capture. You can see your Voter ID and Precinct No. on the "Track Application Status" page once approved.',
  },
  {
    id: 'item-7',
    question: 'How do I transfer my registration?',
    answer:
      'To transfer your voter registration, you need to select "Transfer of Registration Record" as the application type when filling out the form. You will be required to provide details of your previous address and your new address.',
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredFaqItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight flex items-center">
          <HelpCircle className="mr-3 h-8 w-8 text-primary" />
          FAQ / Help Center
        </h2>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <p className="text-muted-foreground">
        Find answers to common questions about voter registration and the VRAMS portal.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Search FAQs</CardTitle>
          <CardDescription>Type keywords to find specific questions or answers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions or answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full mb-4"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFaqItems.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqItems.map((item) => (
                <AccordionItem value={item.id} key={item.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No FAQs found matching your search criteria.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
