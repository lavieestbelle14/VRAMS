
'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, HelpCircle, Search as SearchIcon } from 'lucide-react'; // Added SearchIcon
import { useRouter } from 'next/navigation';


interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode; // Changed to React.ReactNode to support JSX in answers
}

const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I create an account on the VRAMS portal?',
    answer: 'You can create an account by clicking the "Sign Up" tab on the main login page. You will need to provide your first name, last name, email address, and create a password. Ensure your password meets the specified strength requirements.',
  },
  {
    id: 'faq-2',
    question: 'What information is required to fill out the new voter application form?',
    answer: (
      <>
        The application form requires several pieces of information, including:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Personal Information (name, sex, date and place of birth, citizenship)</li>
          <li>Current Address Details</li>
          <li>Period of Residence (in your current city/municipality and in the Philippines)</li>
          <li>Profession/Occupation (optional)</li>
          <li>Civil Status and Parents Information</li>
          <li>Special Needs or Assistance requirements (if any)</li>
          <li>Application Type (New Registration or Transfer)</li>
        </ul>
        For transfer applications, you will also need to provide your previous address.
      </>
    ),
  },
  {
    id: 'faq-3',
    question: 'Can I save my application progress and continue later?',
    answer: 'Yes, the application form automatically saves a draft of your progress in your browser\'s local storage. If you close the browser or navigate away, you can return to the "New Application" page, and your previously entered data should be loaded. You can also manually clear the draft if needed.',
  },
  {
    id: 'faq-4',
    question: 'How can I track the status of my submitted application?',
    answer: 'Navigate to the "Track Application Status" page from the sidebar. You will need to enter your unique Application ID, which you receive after successfully submitting your application. The system will then display the current status of your application.',
  },
  {
    id: 'faq-5',
    question: 'What do the different application statuses mean?',
    answer: (
      <>
        Here are some common statuses and their meanings:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li><strong>Pending:</strong> Your application has been submitted and is awaiting initial review by an election officer.</li>
          <li><strong>Reviewing:</strong> An election officer is currently reviewing your application details.</li>
          <li><strong>Approved - Awaiting Biometrics:</strong> Your application details have been preliminarily approved. You now need to schedule and complete your onsite biometrics capture.</li>
          <li><strong>Approved - Biometrics Scheduled:</strong> You have successfully scheduled your biometrics appointment.</li>
          <li><strong>Approved:</strong> Your application, including biometrics, has been fully processed and approved. Your Voter ID details should be available.</li>
          <li><strong>Rejected:</strong> Your application was not approved. Reasons for rejection should be provided in the remarks.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'faq-6',
    question: 'What should I do if I forget my password?',
    answer: 'On the main login page, under the "Public Login" tab, there is a "Forgot Password?" link. Click this link and follow the instructions to reset your password. You will typically need to provide your registered email address.',
  },
  {
    id: 'faq-7',
    question: 'Where can I schedule my onsite biometrics capture?',
    answer: 'Once your application status is "Approved - Awaiting Biometrics", you can schedule your biometrics appointment through the "Track Application Status" page. A button or link to schedule will appear there.',
  },
  {
    id: 'faq-8',
    question: 'What are the basic eligibility requirements to register as a voter in the Philippines?',
    answer: (
      <>
        To register as a voter, you must be:
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>A citizen of the Philippines.</li>
          <li>At least eighteen (18) years of age on or before the day of the election.</li>
          <li>A resident of the Philippines for at least one (1) year.</li>
          <li>A resident in the city or municipality where you intend to vote for at least six (6) months immediately preceding the election.</li>
          <li>Not otherwise disqualified by law.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'faq-9',
    question: 'What documents should I prepare before starting my online application?',
    answer: 'While the initial online submission doesn\'t always require document uploads, it\'s good to have them ready. Commonly, you might need a valid government-issued ID for verification during biometrics. Specific requirements might be announced by COMELEC, so always check their official website. Examples include: Passport, Driver\'s License, SSS ID, GSIS ID, Postal ID, etc.',
  },
  {
    id: 'faq-10',
    question: 'What happens during the onsite biometrics capture?',
    answer: 'During the biometrics capture, COMELEC personnel will take your photograph, fingerprints, and digital signature. This is a crucial step to complete your registration and ensure your identity in the voter\'s list. You will typically need to present a valid ID and your application reference.',
  },
  {
    id: 'faq-11',
    question: 'My application was rejected. What should I do?',
    answer: 'If your application is rejected, the reason for rejection will usually be provided in the status update or via remarks from the election officer. Review the reason carefully. You may need to correct information and re-apply, or provide additional documentation. If you are unsure, you can contact your local COMELEC office for clarification.',
  },
  {
    id: 'faq-12',
    question: 'When is the deadline for voter registration?',
    answer: 'The deadline for voter registration is set by COMELEC and usually announced well in advance of an election. Please refer to the official COMELEC website or announcements for the most current deadline information for upcoming elections. This portal will also display reminders if a deadline is approaching.',
  },
  {
    id: 'faq-13',
    question: 'I\'ve lost my Application ID. How can I track my status?',
    answer: 'Losing your Application ID can make tracking difficult. It is provided to you upon successful submission and also shown in the acknowledgement receipt. Please keep it secure. If you have lost it, you may need to visit your local COMELEC office for assistance. They might be able to help you retrieve your application details using your personal information, but this process can vary.',
  },
];


export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredFaqs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof faq.answer === 'string' && faq.answer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (React.isValidElement(faq.answer) && faq.answer.props.children.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight flex items-center">
                <HelpCircle className="mr-2 h-8 w-8 text-primary" /> FAQ / Help Center
            </h2>
            <Button variant="outline" onClick={() => router.push('/public/home')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
        </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about the VRAMS portal and voter registration process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
              aria-label="Search FAQs"
            />
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <AccordionTrigger className="text-lg hover:no-underline text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No FAQs found matching your search term. Please try different keywords or clear your search.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
          <CardDescription>If you can't find an answer to your question above, please contact your local COMELEC office.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            For specific inquiries or issues not covered here, reaching out to the official COMELEC channels or visiting a nearby office is recommended for the most accurate and direct assistance.
          </p>
          {/* You could add a link to the official COMELEC website here if available */}
          {/* Example: <Button variant="link" asChild><Link href="https://comelec.gov.ph" target="_blank">Visit COMELEC Official Website</Link></Button> */}
        </CardContent>
      </Card>
    </div>
  );
}
