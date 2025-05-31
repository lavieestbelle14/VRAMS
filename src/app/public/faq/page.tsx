
'use client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    value: "item-1",
    question: "What is VRAMS?",
    answer: "VRAMS stands for Voter Registration and Application Management System. It's a platform designed to streamline the voter registration process, making it more accessible and efficient for Filipino citizens."
  },
  {
    value: "item-2",
    question: "Who can use VRAMS?",
    answer: "All eligible Filipino citizens who wish to register as a voter, transfer their registration, or update their voter information can use VRAMS."
  },
  {
    value: "item-3",
    question: "What types of applications can I submit through VRAMS?",
    answer: "Currently, VRAMS supports new voter registrations and transfers of registration records. Other application types may be added in the future."
  },
  {
    value: "item-4",
    question: "Is my data secure with VRAMS?",
    answer: "Yes, VRAMS is designed with security in mind. We employ measures to protect your personal information. However, always ensure you are on the official VRAMS portal and practice good online safety habits."
  },
  {
    value: "item-5",
    question: "How do I track my application status?",
    answer: "You can use the 'Track Application Status' feature on the portal. You will need your Application ID, which is provided to you after successfully submitting your application."
  },
  {
    value: "item-6",
    question: "What happens after I submit my application online?",
    answer: "After online submission, your application will be reviewed by an Election Officer. If initially approved, you will be required to schedule an appointment for biometrics capture (photo, fingerprints, signature) at a COMELEC office. Your registration is only complete after successful biometrics capture and final approval."
  },
  {
    value: "item-7",
    question: "What if I encounter technical issues?",
    answer: "If you experience technical difficulties, please try clearing your browser's cache and cookies, or try using a different browser. If the issue persists, please note down any error messages and contact the VRAMS support (details usually found on the official COMELEC website)."
  },
  {
    value: "item-8",
    question: "Where can I find my Voter ID after approval?",
    answer: "Once your application is fully approved (including biometrics), your Voter ID number and Precinct details will be visible when you track your application status. The system will also generate a visual representation of your Voter ID."
  },
  {
    value: "item-9",
    question: "Can I use VRAMS to vote online?",
    answer: "No, VRAMS is for voter registration and application management. It does not facilitate online voting. Voting procedures are still conducted as per COMELEC guidelines."
  }
];

export default function FAQPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions (FAQ)</h1>
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
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>Find answers to common questions about VRAMS and the voter registration process.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem value={item.value} key={item.value}>
                <AccordionTrigger className="text-lg hover:no-underline text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
            <CardTitle>Still Have Questions?</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">
                If you can&apos;t find an answer to your question here, please contact your local COMELEC office or visit the official COMELEC website for more information and support channels.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
