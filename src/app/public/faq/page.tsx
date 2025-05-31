
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Search as SearchIcon } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is VRAMS?',
    answer: (
      <p>
        VRAMS (Voter Registration and Application Management System) is a web-based platform designed to modernize and streamline the Philippine voter registration process. It allows Filipino citizens to register, update their records, and track their application status online.
      </p>
    ),
  },
  {
    id: 'faq-2',
    question: 'Who can use VRAMS?',
    answer: (
      <p>
        Any Filipino citizen eligible to vote can use VRAMS. This includes first-time registrants, those needing to transfer their registration, or those wanting to update their voter information.
      </p>
    ),
  },
  {
    id: 'faq-3',
    question: 'How do I create an account?',
    answer: (
      <p>
        You can create an account by clicking on the "Sign Up" tab on the main login page. You will need to provide your first name, last name, email address, and create a password.
      </p>
    ),
  },
  {
    id: 'faq-4',
    question: 'I forgot my password. What should I do?',
    answer: (
      <p>
        Click on the "Forgot Password?" link on the Public Login tab. You will be prompted to enter your registered email address to receive instructions on how to reset your password.
      </p>
    ),
  },
  {
    id: 'faq-5',
    question: 'What types of applications can I submit through VRAMS?',
    answer: (
      <p>
        Currently, VRAMS supports applications for:
      </p>
    ),
  },
  {
    id: 'faq-6',
    question: 'How do I track the status of my application?',
    answer: (
      <p>
        Navigate to the "Track Application Status" page using the sidebar. You will need to enter your Application ID (which you receive after submission) to view the current status of your application.
      </p>
    ),
  },
  {
    id: 'faq-7',
    question: 'What are the basic eligibility requirements to register as a voter in the Philippines?',
    answer: (
      <>
        <p>To register as a voter in the Philippines, you must be:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>A citizen of the Philippines.</li>
          <li>At least eighteen (18) years of age on or before the day of the election.</li>
          <li>A resident of the Philippines for at least one (1) year.</li>
          <li>A resident in the place wherein you propose to vote for at least six (6) months immediately preceding the election.</li>
          <li>Not otherwise disqualified by law.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'faq-8',
    question: 'What documents should I prepare before starting my online application?',
    answer: (
      <>
        <p>While VRAMS aims to simplify the process, it's helpful to have the following information ready:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>Your full legal name, date and place of birth.</li>
          <li>Current and previous addresses (if applicable for transfer).</li>
          <li>Information for citizenship (e.g., birth certificate details, naturalization papers if applicable).</li>
          <li>Name of parents.</li>
          <li>You do not need to upload documents initially, but ensure all information entered is accurate and matches your official records for verification during the biometrics capture.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'faq-9',
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
        </ul>
        <p className="mt-2">This process is crucial for completing your voter registration.</p>
      </>
    ),
  },
  {
    id: 'faq-10',
    question: 'My application was rejected. What should I do?',
    answer: (
      <p>
        If your application is rejected, the officer's remarks should provide a reason. Common reasons include incomplete information, discrepancies, or not meeting eligibility criteria. Review the remarks carefully. You may need to submit a new application with corrected information or provide additional supporting documents as advised.
      </p>
    ),
  },
  {
    id: 'faq-11',
    question: 'When is the deadline for voter registration?',
    answer: (
      <p>
        Voter registration periods are set by COMELEC and usually occur well in advance of an election. Please refer to official COMELEC announcements for specific deadlines for upcoming elections. It's always best to register early.
      </p>
    ),
  },
  {
    id: 'faq-12',
    question: "I've lost my Application ID. How can I track my status?",
    answer: (
      <p>
        Losing your Application ID can make direct tracking difficult through the portal. It's important to save it securely. If lost, you may need to contact your local COMELEC office for assistance. They might be able to help you retrieve your application details if you provide sufficient personal information for verification.
      </p>
    ),
  },
  {
    id: 'faq-13',
    question: "I made a mistake in my application after submitting it. How can I correct it?",
    answer: (
      <p>
        Once an application is submitted through VRAMS, you generally cannot edit it directly online. If you notice a mistake, you should monitor its status. If it's still 'Pending' or 'Reviewing', you might be able to contact your local COMELEC office to inquire about correction procedures. If the error is significant, you might be advised to wait for the application to be processed (potentially rejected if the error is critical) and then re-apply with the correct information. Always double-check your details before submission.
      </p>
    ),
  },
  {
    id: 'faq-14',
    question: "I've moved to a new address after successfully registering. Do I need to update my voter registration?",
    answer: (
      <p>
        Yes. If you have moved to a new permanent address, especially if it's in a different barangay, municipality/city, or province, you need to apply for a "Transfer of Registration Record." This ensures your voter registration is updated to your new locality so you can vote in the correct precinct on election day. You can typically do this through VRAMS by selecting the 'Transfer' application type.
      </p>
    ),
  },
  {
    id: 'faq-15',
    question: "I am a Filipino citizen living abroad. How can I register to vote?",
    answer: (
      <p>
        Filipino citizens residing or working overseas can register to vote under the Overseas Absentee Voting Act. The process usually involves registering at the nearest Philippine embassy or consulate. VRAMS primarily caters to local voter registration within the Philippines. Please check the official COMELEC website or the website of your nearest Philippine diplomatic post for specific guidelines on overseas voter registration.
      </p>
    ),
  },
  {
    id: 'faq-16',
    question: "What should I do if my name is not on the voter's list at the polling precinct on election day, even if I registered?",
    answer: (
      <>
        <p>If your name is not on the official voter's list at your precinct on election day:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>First, calmly speak to the election officers (Board of Election Inspectors - BEI) at the precinct.</li>
          <li>Show them any proof of registration you might have, such as your voter's ID or the acknowledgment receipt from VRAMS (if applicable and recent).</li>
          <li>They may be able to check a master list or guide you on further steps.</li>
          <li>Sometimes, your name might be in a different precinct or there might have been an administrative error.</li>
          <li>If unresolved, you can report the issue to the COMELEC representatives present at the polling center.</li>
        </ul>
        <p className="mt-2">It's crucial to verify your registration status and precinct well before election day using COMELEC's official verification tools to prevent such issues.</p>
      </>
    ),
  },
  {
    id: 'faq-17',
    question: "How is my personal information protected by VRAMS?",
    answer: (
      <p>
        VRAMS is designed with security in mind to protect your personal data in accordance with data privacy laws. Measures include secure data transmission (HTTPS), data storage practices, and access controls. For detailed information, please refer to the VRAMS Privacy Policy, typically linked at the bottom of the portal or during the sign-up process.
      </p>
    ),
  },
];

export default function FaqPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqData;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    return faqData.filter(faq => {
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
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight text-primary">FAQ / Help Center</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Find Answers</CardTitle>
          <CardDescription>Search for frequently asked questions below.</CardDescription>
          <div className="relative mt-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-base"
              aria-label="Search FAQs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq) => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <AccordionTrigger className="text-lg hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No FAQs found matching your search term. Try different keywords or browse all questions.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Still Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            If you can't find the answer to your question, please contact your local COMELEC office or refer to the official COMELEC website for more information.
          </p>
          {/* Placeholder for a contact link or button if available */}
          {/* 
          <Button className="mt-4" asChild>
            <Link href="/public/contact-support">Contact Support</Link>
          </Button> 
          */}
        </CardContent>
      </Card>
    </div>
  );
}
