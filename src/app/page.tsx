
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, ShieldCheck, FileSearch, Accessibility, ArrowRight, UserCheck, FileSignature, Activity } from 'lucide-react';

export default function LandingPage() {
  const logoSrc = "/vrams_logo.png";

  const features = [
    {
      icon: FilePlus2,
      title: 'Easy Online Application',
      description: 'Submit your voter registration or transfer application from anywhere, anytime.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Data Management',
      description: 'Your personal information is protected with robust security measures.',
    },
    {
      icon: FileSearch,
      title: 'Real-time Status Tracking',
      description: 'Easily track the progress of your application online.',
    },
    {
      icon: Accessibility,
      title: 'Accessible to All',
      description: 'Designed for inclusivity, ensuring everyone can participate.',
    },
  ];

  const howItWorksSteps = [
    {
      icon: UserCheck,
      title: '1. Create Your Account',
      description: 'Sign up quickly with your basic details to get started with VRAMS.',
    },
    {
      icon: FileSignature,
      title: '2. Submit Your Application',
      description: 'Fill out the comprehensive online form for new registration or transfer.',
    },
    {
      icon: Activity,
      title: '3. Track Your Progress',
      description: 'Monitor your application status in real-time through your personal dashboard.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2 mr-6">
            <Image
              src={logoSrc}
              alt="VRAMS official seal"
              width={32}
              height={32}
              data-ai-hint="VRAMS official seal"
            />
            <span className="font-bold text-primary">VRAMS</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6 ml-auto">
            <Link href="/auth?tab=public-login" passHref>
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth?tab=sign-up" passHref>
               <Button>Register</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:gap-16 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter text-primary sm:text-4xl md:text-5xl lg:text-6xl/none animate-in fade-in slide-in-from-top-8 duration-700 ease-out">
                  VRAMS: Modernizing Voter Registration in the Philippines
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                  Secure, accessible, and transparent. Register smart, apply easy, vote ready — with VRAMS.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row animate-in fade-in slide-in-from-top-12 duration-700 ease-out delay-300">
                  <Link href="/auth?tab=sign-up" passHref>
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Register Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth?tab=public-login" passHref>
                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                      Access Portal
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="https://placehold.co/1200x675.png"
                alt="Hero VRAMS"
                width={1200}
                height={675}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full animate-in fade-in zoom-in-95 duration-700 ease-out delay-500"
                data-ai-hint="diverse filipino voters election technology"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/30 animate-in fade-in duration-500">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                Everything You Need for a Smooth Process
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                VRAMS simplifies voter registration and management with a user-friendly and secure platform.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-2">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-8 duration-500"
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/30 animate-in fade-in duration-500">Get Started</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                Simple Steps to Register
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                Follow these easy steps to complete your voter registration or manage your application.
              </p>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl md:grid-cols-3 md:gap-12 lg:max-w-5xl">
              {howItWorksSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center text-center p-4 animate-in fade-in slide-in-from-bottom-8 duration-500"
                  style={{ animationDelay: `${150 + index * 150}ms` }}
                >
                  <div className="mb-4 rounded-full bg-primary/20 p-4 text-primary">
                    <step.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About VRAMS Section */}
        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
               <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/30 animate-in fade-in duration-500">About Us</div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-foreground animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                The Future of Voter Registration
              </h2>
              <div className="flex justify-center py-4 animate-in fade-in zoom-in-95 duration-700 ease-out delay-200">
                 <Image
                    src={logoSrc}
                    alt="VRAMS official seal"
                    width={80}
                    height={80}
                    data-ai-hint="VRAMS official seal"
                  />
              </div>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-300">
                The Voter Registration and Application Management System (VRAMS) is a secure, web-based platform
                designed to modernize the Philippine voter registration process. This project aims to address the
                inefficiencies of the traditional system and support COMELEC's goal of inclusive, fast, and
                accessible electoral participation.
              </p>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-400">
                Because in a democracy, every vote counts — and every voter matters.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Image
              src={logoSrc}
              alt="VRAMS official seal"
              width={24}
              height={24}
              data-ai-hint="VRAMS official seal"
            />
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} VRAMS. All rights reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:ml-auto sm:gap-6">
            <Link className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4" href="/public/terms-of-service">
              Terms of Service
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4" href="/public/privacy-policy">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
