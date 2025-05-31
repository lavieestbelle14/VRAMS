
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, HelpCircle, UserCheck, Clock, ListChecks, ShieldCheck, FileText } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

const allFaqItems = [
  {
    id: 'item-1',
    question: 'What is VRAMS?',
    icon: HelpCircle,
    answer: 'VRAMS stands for Voter Registration and Application Management System. It is a secure, web-based platform designed to modernize the Philippine voter registration process, making it faster, more accessible, and transparent for all Filipino citizens.',
  },
  {
    id: 'item-2',
    question: 'Who can use VRAMS?',
    icon: UserCheck,
    answer: 'Any Filipino citizen eligible to vote can use VRAMS to register for the first time, transfer their registration, update their records, or check their application status.',
  },
  {
    id: 'item-3',
    question: 'How do I register as a new voter using VRAMS?',
    icon: FileText,
    answer: 'Navigate to the "New Application" page from the public portal. Fill out the required personal information, address details, and other necessary fields. Once submitted, your application will be reviewed by an election officer. You will then need to schedule and complete an onsite biometrics capture.',
  },
  {
    id: 'item-4',
    question: 'How can I track the status of my application?',
    icon: ListChecks,
    answer: 'You can track your application status by going to the "Track Application Status" page and entering your unique Application ID, which you receive after submitting your application.',
  },
  {
    id: 'item-5',
    question: 'What happens after my application is approved?',
    icon: Clock,
    answer: 'If your application is initially approved, its status will change to "Approved - Awaiting Biometrics." You will then need to schedule an appointment for onsite biometrics capture (photo, fingerprints, signature) through the "Track Application Status" page. Once biometrics are completed and verified, your status will be fully "Approved."',
  },
  {
    id: 'item-6',
    question: 'Is my data secure with VRAMS?',
    icon: ShieldCheck,
    answer: 'Yes, VRAMS is designed with security in mind to protect your personal information. We employ measures to ensure data integrity and confidentiality throughout the registration process.',
  },
  {
    id: 'item-7',
    question: 'What if I need assistance or have special needs?',
    icon: HelpCircle,
    answer: 'The application form includes a section for special needs, such as assistance for PWDs, illiterate individuals, or senior citizens. You can specify your needs, and if you require an assistor, you can provide their details. COMELEC aims to make the process inclusive and accessible.',
  },
  {
    id: 'item-8',
    question: 'Can I update my existing voter registration details?',
    icon: FileText,
    answer: 'Currently, VRAMS primarily focuses on new registrations and transfers. For corrections or updates to existing records not covered by a transfer, please check the main COMELEC website for guidance or visit your local COMELEC office. Future VRAMS updates may expand these features.',
  },
  {
    id: 'item-9',
    question: 'What should I do if I forget my password?',
    icon: HelpCircle,
    answer: 'If you forget your password for the public portal, you can use the "Forgot Password?" link on the login page. You will be guided through a process to reset your password, typically via email.',
  },
  {
    id: 'item-10',
    question: 'Where do I go for my biometrics capture?',
    icon: Clock,
    answer: 'When you schedule your biometrics appointment through VRAMS, the location for the biometrics capture (e.g., "Main COMELEC Office" or a specific local office) will be provided along with your scheduled date and time.',
  }
];


export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchTerm) {
      return allFaqItems;
    }
    return allFaqItems.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">FAQ / Help Center</h1>
        <Link href="/public/home" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find answers to common questions about VRAMS and the voter registration process.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-4 py-2 rounded-md border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => {
                const IconComponent = faq.icon || HelpCircle;
                return (
                  <AccordionItem value={faq.id} key={faq.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center text-left">
                        <IconComponent className="mr-3 h-5 w-5 text-primary shrink-0" />
                        {faq.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-10">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-xl font-semibold">No FAQs Found</p>
              <p className="text-muted-foreground">
                No questions match your search term "{searchTerm}". Try using different keywords or browse all questions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
