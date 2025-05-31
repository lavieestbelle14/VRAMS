
'use client';

import { useState, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Search, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FAQItem {
  id: string;
  question: string;
  answer: ReactNode;
  keywords?: string[]; // Optional: for more targeted search
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-vrams',
    question: 'What is VRAMS?',
    answer:
      'VRAMS stands for Voter Registration and Application Management System. It is a secure, web-based platform designed to modernize the Philippine voter registration process, making it faster, more accessible, and transparent.',
    keywords: ['vrams', 'system', 'about'],
  },
  {
    id: 'how-to-register',
    question: 'How do I register to vote using VRAMS?',
    answer: (
      <>
        <p>To register using VRAMS:</p>
        <ol className="list-decimal pl-6 mt-2 space-y-1">
          <li>Navigate to the "New Application" page.</li>
          <li>Fill out the digital application form completely and accurately.</li>
          <li>Review your details and submit the form.</li>
          <li>You will receive an Application ID. Keep this ID to track your status and for your biometrics appointment.</li>
          <li>Wait for notification regarding your application status and biometrics schedule.</li>
        </ol>
      </>
    ),
    keywords: ['register', 'application', 'steps', 'process'],
  },
  {
    id: 'track-status',
    question: 'How can I track my application status?',
    answer:
      'You can track your application status by navigating to the "Track Application Status" page and entering your unique Application ID that was provided to you upon submission.',
    keywords: ['track', 'status', 'application id'],
  },
  {
    id: 'forgot-password',
    question: 'I forgot my password. What should I do?',
    answer:
      'If you have forgotten your password for your public user account, you can use the "Forgot Password?" link on the Public Login tab. You will be guided through steps to reset your password, typically via email verification.',
    keywords: ['password', 'forgot', 'reset', 'account'],
  },
  {
    id: 'eligibility',
    question: 'What are the basic eligibility requirements to register as a voter in the Philippines?',
    answer: (
      <>
        <p>To be eligible to register as a voter, you must be:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>A Filipino citizen.</li>
          <li>At least eighteen (18) years of age on or before the day of the election.</li>
          <li>A resident of the Philippines for at least one (1) year.</li>
          <li>A resident in the place wherein you propose to vote for at least six (6) months immediately preceding the election.</li>
          <li>Not otherwise disqualified by law.</li>
        </ul>
      </>
    ),
    keywords: ['eligible', 'requirements', 'age', 'residency', 'citizen'],
  },
  {
    id: 'documents',
    question: 'What documents should I prepare before starting my online application?',
    answer: (
      <>
        <p>While the initial online submission through VRAMS may not require immediate document uploads, you should have the following information ready and may need to present original documents or valid IDs during your biometrics capture or as requested by COMELEC:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Your full legal name, date of birth, place of birth, sex, and civil status.</li>
          <li>Current and previous (if applicable for transfer) address details.</li>
          <li>Citizenship details (e.g., if naturalized, your naturalization certificate details).</li>
          <li>A valid government-issued ID is typically required for verification during onsite processes (e.g., Passport, Driver&apos;s License, SSS ID, GSIS ID, Postal ID, PRC ID, National ID).</li>
        </ul>
        <p className="mt-2">It&apos;s best to check the official COMELEC website or announcements for the most current list of required documents.</p>
      </>
    ),
    keywords: ['documents', 'prepare', 'id', 'requirements', 'information'],
  },
  {
    id: 'biometrics-process',
    question: 'What happens during the onsite biometrics capture?',
    answer: (
      <>
        <p>
          During your scheduled biometrics appointment, COMELEC personnel will:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Verify your identity and submitted application details.</li>
          <li>Capture your photograph.</li>
          <li>Take your digital fingerprints.</li>
          <li>Obtain your digital signature.</li>
          <li>You will then receive an acknowledgement receipt.</li>
        </ul>
        <p className="mt-2">
          Please bring a valid ID for verification.
        </p>
      </>
    ),
    keywords: ['biometrics', 'onsite', 'capture', 'appointment', 'fingerprints', 'photo', 'signature'],
  },
  {
    id: 'application-rejection',
    question: 'My application was rejected. What should I do?',
    answer:
      'If your application is rejected, the reason for rejection should be provided (check your status on VRAMS or any communication from COMELEC). You may need to correct the information and re-apply, or provide additional documentation. Contact your local COMELEC office for specific guidance.',
    keywords: ['rejected', 'denied', 'reapply', 'correction', 'reason'],
  },
  {
    id: 'registration-deadline',
    question: 'When is the deadline for voter registration?',
    answer:
      'Voter registration periods and deadlines are announced by COMELEC prior to an election. Please refer to the official COMELEC website or their official announcements for the most current registration schedules and deadlines. VRAMS will also reflect these periods.',
    keywords: ['deadline', 'schedule', 'last day', 'registration period'],
  },
  {
    id: 'lost-app-id',
    question: 'I\'ve lost my Application ID. How can I track my status?',
    answer:
      'If you have lost your Application ID, try to check any email confirmation you might have received upon submission. If you cannot find it, you may need to contact your local COMELEC office or the VRAMS support (if available) for assistance in retrieving your application details or status. They might ask for other identifying information.',
    keywords: ['lost id', 'application id', 'retrieve', 'find', 'track help'],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return faqData.filter(faq => {
      const questionMatch = faq.question.toLowerCase().includes(lowerSearchTerm);
      let answerMatch = false;

      // Simple string conversion for JSX answers for basic searchability
      const stringifyNode = (node: ReactNode): string => {
        if (typeof node === 'string') return node;
        if (typeof node === 'number') return String(node);
        if (Array.isArray(node)) return node.map(stringifyNode).join(' ');
        if (React.isValidElement(node) && node.props.children) {
          return stringifyNode(node.props.children);
        }
        return '';
      };

      answerMatch = stringifyNode(faq.answer).toLowerCase().includes(lowerSearchTerm);
      const keywordMatch = faq.keywords?.some(kw => kw.toLowerCase().includes(lowerSearchTerm));

      return questionMatch || answerMatch || !!keywordMatch;
    });
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">FAQ / Help Center</h2>
        </div>
        <Button variant="outline" onClick={() => router.push('/public/home')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
        </Button>
      </div>
      <p className="text-muted-foreground">
        Find answers to common questions about VRAMS and the voter registration process.
      </p>

      <div className="relative">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full shadow-sm"
        />
      </div>

      {filteredFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filteredFaqs.map((faq) => (
            <AccordionItem value={faq.id} key={faq.id} className="border rounded-lg shadow-sm bg-card">
              <AccordionTrigger className="p-4 text-left hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg font-semibold">No FAQs found matching your search.</p>
          <p className="text-muted-foreground">Try using different keywords or browse all FAQs by clearing the search.</p>
        </div>
      )}

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Contact your local COMELEC office for more assistance.
        </p>
      </div>
    </div>
  );
}
