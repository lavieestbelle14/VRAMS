
'use client';

import * as React from 'react'; // Added this import
import { useState, useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HelpCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode; 
  category: string;
}

const faqs: FAQItem[] = [
  // General Questions
  {
    question: "What is VRAMS?",
    answer: "VRAMS stands for Voter Registration and Application Management System. It's a digital platform designed to streamline the voter registration process, making it more accessible and efficient for Filipino citizens.",
    category: "General",
  },
  {
    question: "Who can use VRAMS?",
    answer: "VRAMS is for Filipino citizens eligible to vote. This includes first-time registrants, those needing to transfer their registration, or update their voter information.",
    category: "General",
  },
  {
    question: "Is VRAMS secure?",
    answer: "Yes, VRAMS is built with security in mind to protect your personal information. We use industry-standard practices to ensure data privacy and integrity.",
    category: "General",
  },

  // Registration Process
  {
    question: "How do I register to vote using VRAMS?",
    answer: (
      <>
        To register using VRAMS:
        <ol className="list-decimal list-inside ml-4 mt-2 space-y-1">
          <li>Navigate to the 'New Application' page.</li>
          <li>Fill out the online application form completely and accurately.</li>
          <li>Review your information for any errors.</li>
          <li>Submit your application.</li>
          <li>You will receive an application ID. Keep this ID to track your application status.</li>
          <li>Await notification for your biometrics capture schedule at a designated COMELEC office or satellite registration site.</li>
        </ol>
      </>
    ),
    category: "Registration",
  },
  {
    question: "What documents do I need to prepare for registration?",
    answer: "While the initial online application doesn't require document uploads, you will need to present valid identification during your biometrics capture. Accepted IDs typically include government-issued IDs like Passport, Driver's License, SSS ID, PhilHealth ID, Postal ID, etc. Check the COMELEC website for a complete list of accepted IDs.",
    category: "Registration",
  },
  {
    question: "What is biometrics capture?",
    answer: "Biometrics capture involves taking your digital photograph, fingerprints, and signature. This is a mandatory step to complete your voter registration and is done in person at a COMELEC office or designated satellite registration center.",
    category: "Registration",
  },
  {
    question: "Can I update my voter registration details using VRAMS?",
    answer: "Currently, VRAMS primarily facilitates new registrations and transfers. For other updates or corrections to existing records, please check the official COMELEC guidelines or visit your local COMELEC office. Some minor updates might be possible through specific application types if available.",
    category: "Registration",
  },
  {
    question: "How do I transfer my voter registration to a new address?",
    answer: "Select the 'Transfer of Registration' option when filling out the application form on VRAMS. You will need to provide details of both your old and new addresses.",
    category: "Registration",
  },

  // Application Tracking
  {
    question: "How can I track the status of my application?",
    answer: "You can track your application status on the 'Track Application Status' page using the Application ID provided to you upon submission.",
    category: "Tracking",
  },
  {
    question: "What do the different application statuses mean?",
    answer: (
      <>
        Common statuses include:
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li><strong>Pending:</strong> Your application has been submitted and is awaiting initial review.</li>
          <li><strong>Reviewing:</strong> Your application is currently being reviewed by an election officer.</li>
          <li><strong>Approved (Awaiting Biometrics):</strong> Your initial application details have been approved. You need to complete your biometrics capture.</li>
          <li><strong>Approved (Biometrics Scheduled):</strong> Your biometrics capture has been scheduled. Check your email or the portal for details.</li>
          <li><strong>Approved:</strong> Your application, including biometrics, has been fully approved. Your Voter ID may be in process.</li>
          <li><strong>Rejected:</strong> Your application was not approved. Reasons for rejection will typically be provided.</li>
        </ul>
      </>
    ),
    category: "Tracking",
  },
  {
    question: "What if my application is rejected?",
    answer: "If your application is rejected, the reason will usually be provided in the status update or via remarks. You may need to correct information and re-apply, or contact your local COMELEC office for clarification.",
    category: "Tracking",
  },

  // Technical Support & Others
  {
    question: "I forgot my password for VRAMS public portal. What should I do?",
    answer: "If you've forgotten your password, you can use the 'Forgot Password?' link on the Public Login tab. You'll need to enter your registered email address to receive instructions on how to reset your password.",
    category: "Technical",
  },
  {
    question: "Who do I contact if I have more questions or encounter issues?",
    answer: (
      <>
        For technical issues with the VRAMS portal, you can try reaching out through any contact information provided on the official COMELEC website. For questions regarding election laws, registration eligibility, or specific concerns about your application, it's best to contact your <Link href="https://comelec.gov.ph/?r=References/FieldOffices" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">local COMELEC office</Link> directly or visit the official <Link href="https://comelec.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">COMELEC website</Link>.
      </>
    ),
    category: "Technical",
  },
  {
    question: "When is the deadline for voter registration?",
    answer: "Voter registration periods and deadlines are set by COMELEC and are usually announced well in advance of an election. Please refer to official COMELEC announcements for the most current information on registration schedules.",
    category: "General",
  },
];

const categories = ["All", ...new Set(faqs.map(faq => faq.category))];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const categoryMatch = selectedCategory === 'All' || faq.category === selectedCategory;
      
      if (!categoryMatch) return false;
      if (!searchTerm) return true;

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
      return questionMatch || answerMatch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <HelpCircle className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl font-bold">FAQ / Help Center</CardTitle>
              <CardDescription className="text-lg">
                Find answers to common questions about VRAMS and the voter registration process.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base py-3"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                    ${selectedCategory === category 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <AccordionTrigger className="p-4 text-left text-lg font-semibold hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-0 text-base text-foreground/90 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8 text-lg">
              No FAQs found matching your criteria. Try a different search term or category.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
