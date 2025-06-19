
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, ArrowLeft } from 'lucide-react'; // Added ArrowLeft
import * as React from 'react'; // Added React import
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string | React.ReactNode; 
  category: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 'gen1',
    question: 'What is eRehistroPh?',
    answer: 'eRehistroPh stands for Voter Registration and Application Management System. It is a web-based platform designed to modernize and streamline the voter registration process in the Philippines, making it faster, more accessible, and transparent for all Filipino citizens.',
    category: 'General',
  },
  {
    id: 'gen2',
    question: 'Who can use eRehistroPh?',
    answer: 'Any Filipino citizen eligible to vote can use eRehistroPh to register for the first time, transfer their registration, or update their voter information.',
    category: 'General',
  },
  {
    id: 'gen3',
    question: 'Is eRehistroPh secure?',
    answer: 'Yes, eRehistroPh is designed with security in mind to protect your personal information. We use industry-standard security measures to ensure data privacy and integrity.',
    category: 'General',
  },

  // Registration Process
  {
    id: 'reg1',
    question: 'How do I register to vote using eRehistroPh?',
    answer: (
      <>
        <p className="mb-2">To register using eRehistroPh, follow these steps:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Create an account on the eRehistroPh portal.</li>
          <li>Log in to your account.</li>
          <li>Click on the "New Application" link.</li>
          <li>Fill out the online application form completely and accurately.</li>
          <li>Review your application details.</li>
          <li>Submit your application.</li>
          <li>Wait for notification regarding your biometrics capture schedule.</li>
          <li>Appear for your scheduled biometrics capture at the designated COMELEC office.</li>
        </ol>
      </>
    ),
    category: 'Registration Process',
  },
  {
    id: 'reg2',
    question: 'What documents do I need to prepare for registration?',
    answer: 'While the initial online application on eRehistroPh may not require immediate document uploads, you will typically need to present valid identification during your biometrics capture. Common valid IDs include Philippine Passport, Driver’s License, SSS/GSIS ID, UMID, Postal ID, PRC ID, etc. Please check the official COMELEC website for a complete list of accepted IDs.',
    category: 'Registration Process',
  },
  {
    id: 'reg3',
    question: 'Can I transfer my voter registration using eRehistroPh?',
    answer: 'Yes, eRehistroPh supports applications for transfer of registration records. You will need to provide your new address details and, if applicable, your previous address details.',
    category: 'Registration Process',
  },
  {
    id: 'reg4',
    question: 'What is biometrics capture?',
    answer: 'Biometrics capture involves taking your digital photograph, fingerprints, and signature. This is a mandatory step to complete your voter registration and is done in person at a COMELEC office or designated satellite registration sites.',
    category: 'Registration Process',
  },
  {
    id: 'reg5',
    question: 'I made a mistake in my application. Can I edit it after submission?',
    answer: 'Once an application is submitted, you generally cannot edit it directly through eRehistroPh. If you notice an error, please contact your local COMELEC office or wait for their feedback. Minor corrections might be handled during your biometrics appointment.',
    category: 'Registration Process',
  },

  // Account and Technical Support
  {
    id: 'acc1',
    question: 'I forgot my password. How can I reset it?',
    answer: 'You can reset your password by clicking on the "Forgot Password?" link on the login page. You will receive instructions via email to set a new password.',
    category: 'Account & Technical Support',
  },
  {
    id: 'acc2',
    question: 'I am having trouble accessing the eRehistroPh website. What should I do?',
    answer: 'Please ensure you have a stable internet connection and are using a compatible web browser (e.g., latest versions of Chrome, Firefox, Safari, Edge). If the problem persists, try clearing your browser cache or contact eRehistroPh support through the provided channels.',
    category: 'Account & Technical Support',
  },
  {
    id: 'acc3',
    question: 'How can I update my profile information (e.g., email, contact number)?',
    answer: 'You can update your profile information such as your email and contact number by logging into your eRehistroPh account and navigating to the "My Profile" section.',
    category: 'Account & Technical Support',
  },
  
  // Application Status & Tracking
  {
    id: 'stat1',
    question: 'How can I track the status of my application?',
    answer: 'Log in to your eRehistroPh account and navigate to the "Track Application Status" section. You will need your Application ID to view the current status.',
    category: 'Application Status & Tracking',
  },
  {
    id: 'stat2',
    question: 'What do the different application statuses mean?',
    answer: (
      <>
        <p className="mb-2">Common application statuses include:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Pending:</strong> Your application has been submitted and is awaiting initial review.</li>
          <li><strong>Reviewing:</strong> Your application is currently being reviewed by an election officer.</li>
          <li><strong>Approved Awaiting Biometrics:</strong> Your initial application details have been approved. You need to schedule and complete your biometrics capture.</li>
          <li><strong>Approved Biometrics Scheduled:</strong> Your biometrics appointment has been scheduled.</li>
          <li><strong>Approved:</strong> Your application, including biometrics, has been fully approved. Your Voter ID and precinct details will be available.</li>
          <li><strong>Rejected:</strong> Your application was not approved. Reasons for rejection will be provided.</li>
        </ul>
      </>
    ),
    category: 'Application Status & Tracking',
  },
  {
    id: 'stat3',
    question: 'How long does the voter registration process take?',
    answer: 'The processing time can vary depending on the volume of applications and the COMELEC’s schedule. eRehistroPh aims to expedite the initial application, but the entire process, including biometrics, may take several weeks or months. Please regularly check your application status on eRehistroPh.',
    category: 'Application Status & Tracking',
  },
  {
    id: 'stat4',
    question: 'What should I do if my application is rejected?',
    answer: 'If your application is rejected, eRehistroPh will provide the reason(s) for rejection. You may need to submit a new application with corrected information or provide additional documentation as required by COMELEC.',
    category: 'Application Status & Tracking',
  }
];


export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const allCategories = ['All', ...new Set(faqData.map(faq => faq.category))];
    return allCategories;
  }, []);

  const filteredFaqs = useMemo(() => {
    return faqData.filter(faq => {
      const categoryMatch = selectedCategory === 'All' || faq.category === selectedCategory;
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      if (!searchTerm) return categoryMatch;

      const questionMatch = faq.question.toLowerCase().includes(lowerSearchTerm);
      let answerMatch = false;
      if (typeof faq.answer === 'string') {
        answerMatch = faq.answer.toLowerCase().includes(lowerSearchTerm);
      } else if (React.isValidElement(faq.answer)) {
        // Basic text extraction from JSX for search. This might not be perfect for complex JSX.
        const extractText = (node: React.ReactNode): string => {
          if (typeof node === 'string') return node.toLowerCase();
          if (Array.isArray(node)) return node.map(extractText).join(' ');
          if (React.isValidElement(node) && node.props.children) {
            return extractText(node.props.children);
          }
          return '';
        };
        answerMatch = extractText(faq.answer).includes(lowerSearchTerm);
      }
      return categoryMatch && (questionMatch || answerMatch);
    });
  }, [searchTerm, selectedCategory]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center">
            <HelpCircle className="h-8 w-8 mr-3 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-primary">FAQ / Help Center</h1>
        </div>
        <Button variant="outline" asChild>
            <Link href="/public/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about eRehistroPh and the voter registration process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map(faq => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <AccordionTrigger className="text-base hover:text-primary transition-colors duration-200">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground prose prose-sm max-w-none">
                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No FAQs found matching your search criteria or selected category.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
