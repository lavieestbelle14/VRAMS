
'use client';

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  keywords?: string[];
}

const faqs: FAQItem[] = [
  {
    id: 'q1',
    question: 'How do I register to vote?',
    answer:
      'To register to vote, you need to fill out the online application form available in the "New Application" section of this portal. Ensure all required information is provided accurately. After submission, your application will be reviewed.',
    keywords: ['register', 'application', 'how to', 'form'],
  },
  {
    id: 'q2',
    question: 'What are the requirements for voter registration?',
    answer:
      'You must be a Filipino citizen, at least 18 years of age on or before election day, a resident of the Philippines for at least one year, and a resident in the place where you intend to vote for at least six months immediately preceding the election. Specific documents may be required for certain application types.',
    keywords: ['requirements', 'eligibility', 'age', 'residency', 'citizen'],
  },
  {
    id: 'q3',
    question: 'How can I track the status of my application?',
    answer:
      'You can track your application status by navigating to the "Track Application Status" page and entering your Application ID, which you received after submitting your form.',
    keywords: ['track', 'status', 'application id', 'progress'],
  },
  {
    id: 'q4',
    question: 'What should I do if I made a mistake in my application?',
    answer:
      'If your application has not yet been approved, you may need to contact your local election office for guidance on how to correct errors. If it involves a change of name or correction of entries, this typically requires a specific application process.',
    keywords: ['mistake', 'error', 'correction', 'change'],
  },
  {
    id: 'q5',
    question: 'How long does the application review process take?',
    answer:
      'The review process duration can vary. You can monitor the status of your application through the "Track Application Status" page. You will be notified once a decision has been made or if further action is required from your end.',
    keywords: ['review time', 'duration', 'processing', 'how long'],
  },
  {
    id: 'q6',
    question: 'What is an Application ID?',
    answer:
      'The Application ID is a unique reference number assigned to your application upon submission. It is essential for tracking the status of your application. Please keep it safe.',
    keywords: ['application id', 'reference number'],
  },
  {
    id: 'q7',
    question: 'Can I submit an application for someone else?',
    answer:
      'Generally, voter registration is a personal application. However, assistance can be provided to individuals who are illiterate or persons with disabilities (PWDs), by an assistor of their choice. Details of the assistor must be provided in the form.',
    keywords: ['assistance', 'someone else', 'pwd', 'illiterate'],
  },
  {
    id: 'q8',
    question: 'What happens after my application is approved?',
    answer:
      'Once your application is approved, you will be officially registered as a voter. You will receive a Voter ID number and precinct details. You can check these details on the "Track Application Status" page.',
    keywords: ['approved', 'voter id', 'precinct', 'next steps'],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqs;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(lowerSearchTerm) ||
        faq.answer.toLowerCase().includes(lowerSearchTerm) ||
        (faq.keywords && faq.keywords.some(keyword => keyword.toLowerCase().includes(lowerSearchTerm)))
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2 text-primary">
            <HelpCircle className="h-8 w-8" />
            <CardTitle className="text-3xl font-bold">Frequently Asked Questions (FAQ)</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Find answers to common questions about the voter registration process and using this portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-base border-2 border-border focus:border-primary transition-colors duration-200 rounded-lg shadow-sm"
            />
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {filteredFaqs.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id} className="border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 bg-card">
                  <AccordionTrigger className="p-4 text-left font-semibold text-lg hover:bg-muted/50 rounded-t-lg transition-colors duration-150">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 text-base text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground text-lg py-8">
              No FAQs found matching your search term.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
