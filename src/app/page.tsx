"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus2, ShieldCheck, FileSearch, Accessibility, ArrowRight, UserCheck, FileSignature, Activity, CheckCircle, Star, Users, Award, Vote, Calendar, Clock, MapPin } from 'lucide-react';

export default function LandingPage() {
  const logoSrc = "/vrams_logo.png";
  const [currentStep, setCurrentStep] = useState(0);

  const features = [
    {
      icon: FilePlus2,
      title: 'Easy Online Application',
      description: 'Submit your voter registration or transfer application from anywhere, anytime with our intuitive digital platform.',
      color: 'from-blue-600 to-blue-800'
    },
    {
      icon: ShieldCheck,
      title: 'Secure Data Management',
      description: 'Your personal information is protected with advanced security measures and encryption protocols.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: FileSearch,
      title: 'Real-time Status Tracking',
      description: 'Monitor your application progress with live updates and instant notifications.',
      color: 'from-blue-600 to-blue-800'
    },
    {
      icon: Accessibility,
      title: 'Accessible to All',
      description: 'Designed for inclusivity with multi-language support and accessibility features.',
      color: 'from-yellow-500 to-yellow-600'
    },
  ];

  const howItWorksSteps = [
    {
      icon: UserCheck,
      title: 'Create Your Account',
      description: 'Sign up quickly with your basic details to get started with VRAMS.',
      step: '01'
    },
    {
      icon: FileSignature,
      title: 'Submit Your Application',
      description: 'Fill out the comprehensive online form for new registration or transfer.',
      step: '02'
    },
    {
      icon: Activity,
      title: 'Track Your Progress',
      description: 'Monitor your application status in real-time through your personal dashboard.',
      step: '03'
    },
  ];

  // Interactive Dashboard Preview Component
  const DashboardPreview = () => {
    const [activeTab, setActiveTab] = useState('status');
    
    const mockData = {
      status: {
        applicationId: 'VR-2024-001234',
        status: 'Under Review',
        progress: 75,
        nextStep: 'Document Verification',
        estimatedCompletion: '3-5 business days'
      },
      schedule: [
        { date: 'Dec 15, 2024', event: 'Application Submitted', completed: true },
        { date: 'Dec 18, 2024', event: 'Initial Review', completed: true },
        { date: 'Dec 22, 2024', event: 'Document Verification', completed: false },
        { date: 'Dec 28, 2024', event: 'Final Approval', completed: false }
      ]
    };

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 4);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-lg mx-auto">
        {/* Dashboard Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Vote className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-bold">VRAMS Portal</h3>
              <p className="text-blue-100 text-sm">Voter Registration Dashboard</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'status' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'bg-blue-700 text-blue-100 hover:bg-blue-600'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'timeline' 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'bg-blue-700 text-blue-100 hover:bg-blue-600'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Application ID</span>
                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {mockData.status.applicationId}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    {mockData.status.status}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{mockData.status.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-blue-800 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${mockData.status.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Next Step</p>
                    <p className="text-sm text-blue-700">{mockData.status.nextStep}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Est. completion: {mockData.status.estimatedCompletion}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {mockData.schedule.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`mt-1 w-3 h-3 rounded-full border-2 ${
                    item.completed 
                      ? 'bg-green-500 border-green-500' 
                      : index === currentStep 
                        ? 'bg-yellow-500 border-yellow-500 animate-pulse' 
                        : 'bg-gray-200 border-gray-300'
                  }`}></div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        item.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {item.event}
                      </p>
                      {item.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="px-6 pb-6">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Vote className="h-4 w-4 mr-2" />
            Access Full Dashboard
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container flex h-16 items-center">
          <a href="/" className="flex items-center gap-3 mr-6 group">
            <div className="relative">
              <img
                src={logoSrc}
                alt="VRAMS official seal"
                width={40}
                height={40}
                className="transition-transform group-hover:scale-110"
                data-ai-hint="VRAMS official seal"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-full opacity-0 group-hover:opacity-20 transition-opacity blur-xl"></div>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">VRAMS</span>
          </a>
          <nav className="flex items-center gap-4 text-sm lg:gap-6 ml-auto">
            <a href="/auth?tab=public-login">
              <Button variant="outline" className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200">Login</Button>
            </a>
            <a href="/auth?tab=sign-up">
               <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-200">Register</Button>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-yellow-50/30"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-blue-600/20 to-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-800/20 to-blue-600/20 rounded-full blur-3xl"></div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-yellow-100 rounded-full text-sm font-medium text-blue-700 border border-blue-200/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                  🇵🇭 Modernizing Philippine Elections
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl/none animate-in fade-in slide-in-from-top-8 duration-700 ease-out">
                  <span className="bg-gradient-to-r from-blue-600 via-blue-800 to-blue-900 bg-clip-text text-transparent">
                    VRAMS
                  </span>
                  <br />
                  <span className="text-gray-800">Voter Registration</span>
                  <br />
                  <span className="text-gray-600 text-3xl sm:text-4xl md:text-5xl">Made Simple</span>
                </h1>
                <p className="max-w-[600px] text-xl text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                  Experience the future of voter registration with our secure, accessible, and transparent platform. 
                  <span className="font-semibold text-blue-600">Register smart, apply easy, vote ready.</span>
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row animate-in fade-in slide-in-from-top-12 duration-700 ease-out delay-300">
                  <a href="/auth?tab=sign-up">
                    <Button size="lg" className="w-full min-[400px]:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-8 py-6">
                      Register Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a href="/auth?tab=public-login">
                    <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto border-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-lg px-8 py-6">
                      Access Portal
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Interactive Dashboard Preview */}
              <div className="relative animate-in fade-in zoom-in-95 duration-700 ease-out delay-500">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-yellow-500/20 rounded-3xl blur-2xl scale-105"></div>
                <div className="relative">
                  <DashboardPreview />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-yellow-100 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200/50 animate-in fade-in duration-500">
                ✨ Key Features
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                Everything You Need for a
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Smooth Process</span>
              </h2>
              <p className="max-w-[800px] text-xl text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                VRAMS simplifies voter registration and management with cutting-edge technology and user-centric design.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group relative overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out border-0 bg-white/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-500"
                  style={{ animationDelay: `${100 + index * 100}ms` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-gray-900 group-hover:text-blue-700 transition-colors">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-20 md:py-32 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="inline-block rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200/50 shadow-sm animate-in fade-in duration-500">
                🚀 Get Started
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900 animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Three Simple Steps</span>
                <br />to Register
              </h2>
              <p className="max-w-[800px] text-xl text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-10 duration-700 ease-out delay-200">
                Join thousands of Filipinos who have already modernized their voter registration experience.
              </p>
            </div>
            <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto">
              {howItWorksSteps.map((step, index) => (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center text-center p-8 group animate-in fade-in slide-in-from-bottom-8 duration-500"
                  style={{ animationDelay: `${150 + index * 150}ms` }}
                >
                  {/* Connection Line */}
                  {index < howItWorksSteps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600 to-yellow-500 transform translate-x-1/2 z-0"></div>
                  )}
                  
                  {/* Step Number */}
                  <div className="relative mb-6 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity scale-150"></div>
                    <div className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      <span className="text-xs font-bold text-blue-800">{step.step}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-blue-700 transition-colors">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About VRAMS Section */}
        <section id="about" className="w-full py-20 md:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
               <div className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-yellow-100 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-200/50 animate-in fade-in duration-500">
                 🏛️ About Us
               </div>
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl text-gray-900 animate-in fade-in slide-in-from-top-8 duration-700 ease-out delay-100">
                The Future of 
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"> Voter Registration</span>
              </h2>
              
              <div className="flex justify-center py-8 animate-in fade-in zoom-in-95 duration-700 ease-out delay-200">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-yellow-500/20 rounded-full blur-2xl scale-150"></div>
                  <img
                    src={logoSrc}
                    alt="VRAMS official seal"
                    width={120}
                    height={120}
                    className="relative drop-shadow-lg"
                    data-ai-hint="VRAMS official seal"
                  />
                </div>
              </div>
              
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-300">
                  The <span className="font-semibold text-blue-600">Voter Registration and Application Management System (VRAMS)</span> is a revolutionary, 
                  secure web-based platform designed to modernize the Philippine voter registration process. Built with cutting-edge technology 
                  and user-centric design principles, VRAMS addresses the inefficiencies of traditional systems while supporting COMELEC's 
                  vision of inclusive, fast, and accessible electoral participation.
                </p>
                
                <div className="bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl p-8 border border-blue-100 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-400">
                  <p className="text-xl font-medium text-gray-800 italic">
                    "Because in a democracy, every vote counts — and every voter matters."
                  </p>
                </div>
              </div>

              {/* CTA Section */}
              <div className="pt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out delay-500">
                <a href="/auth?tab=sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-200 text-lg px-12 py-6">
                    Join the Future of Voting <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoSrc}
                  alt="VRAMS official seal"
                  width={32}
                  height={32}
                  data-ai-hint="VRAMS official seal"
                />
                <span className="font-bold text-xl bg-gradient-to-r from-blue-400 to-yellow-400 bg-clip-text text-transparent">VRAMS</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Modernizing Philippine voter registration with secure, accessible, and transparent technology.
              </p>
            </div>
            
            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Quick Links</h3>
              <div className="space-y-2">
                <a href="/auth?tab=sign-up" className="block text-gray-400 hover:text-white transition-colors">
                  Register to Vote
                </a>
                <a href="/auth?tab=public-login" className="block text-gray-400 hover:text-white transition-colors">
                  Check Application Status
                </a>
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">
                  Features
                </a>
              </div>
            </div>
            
            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Legal</h3>
              <div className="space-y-2">
                <a href="/public/terms-of-service" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="/public/privacy-policy" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} VRAMS. All rights reserved. Built for the Filipino people.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
