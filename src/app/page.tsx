"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { FilePlus2, ShieldCheck, Zap, Globe, ArrowRight, CheckCircle, Calendar, User, FileText, MapPin, Users, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from "framer-motion";

export default function VRAMSLandingPage() {
  const router = useRouter();
  const logoSrc = "/vrams_logo.png";

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const registrationTimeline = [
    {
      date: "1 JUL",
      year: "2025",
      title: "Start of Online Application",
      description: "Registration period begins"
    },
    {
      date: "11JUL",
      year: "2025",
      title: "End of Online Application",
      description: "Registration period ends"
    },
{
  date: "1 DEC",
  year: "2025",
  title: "Barangay/SK Elections",
  description: "Official election day for Barangay and SK positions"
  
}
  ];

  const features = [
    {
      icon: FilePlus2,
      title: 'Digital Registration',
      description: 'Complete your voter registration entirely online in minutes'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy-Conscious Design',
      description: 'Developed with careful consideration for user privacy'
    },
    {
      icon: Zap,
      title: 'Application Status Tracking',
      description: 'Stay informed with timely updates on your application progress'
    },
    {
      icon: Globe,
      title: 'Nationwide Access',
      description: 'Available to all Filipinos worldwide'
    }
  ];

  const requirements = [
    {
      icon: User,
      title: "Personal Information",
      items: ["Full name", "Birth details", "Current address"]
    },
    {
      icon: FileText,
      title: "Documents",
      items: ["Valid ID", "Proof of residence", "1x1 photo"]
    },
    {
      icon: CheckCircle,
      title: "Eligibility",
      items: ["Filipino citizen", "18+ years old (or 15-17 for SK)", "1+ year residency"]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      {/* Hero Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-a from-white/60 to-blue-800/60 backdrop-blur-md backdrop-saturate-180 shadow-sm transition-all text-blue-900">
        <div className="absolute inset-0 bg-[url('/grid-pattern.png')] opacity-10"></div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logoSrc} alt="VRAMS Logo" className="h-12 w-12" />
              <div>
                <div className="text-xs font-light tracking-wider">VOTER REGISTRATION AND</div>
                <div className="text-xl font-bold tracking-tight">APPLICATION MANAGEMENT SYSTEM</div>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="font-medium hover:text-yellow-300 transition-colors cursor-pointer"
              >
                HOME
              </button>
              <button 
                onClick={() => router.push('/auth?tab=sign-up')}
                className="font-medium hover:text-yellow-300 transition-colors cursor-pointer"
              >
                REGISTER
              </button>
              <button 
                onClick={() => scrollToSection('dates')}
                className="font-medium hover:text-yellow-300 transition-colors cursor-pointer"
              >
                DATES
              </button>
              <button 
                onClick={() => scrollToSection('requirements')}
                className="font-medium hover:text-yellow-300 transition-colors cursor-pointer"
              >
                REQUIREMENTS
              </button>
              <Button
                variant="outline"
                className="border-white text-white bg-blue-900"
                onClick={() => router.push('/auth?tab=login')}
              >
                Login
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-blue-900 text-white py-20">
        <div className="absolute inset-0 bg-[url('/noise-texture.png')] opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="max-w-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 w-fit">
                <p className="text-sm font-medium">🇵🇭 Modernizing Philippine Election</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-yellow-300">VRAMS</span>: Your Gateway to Democracy
              </h1>
              <p className="text-base md:text-lg font-light mb-10 max-w-2xl leading-relaxed">
                The Voter Registration and Application Management System (VRAMS) aims to strengthen democratic participation by providing every Filipino citizen with secure, efficient digital voter registration services. Our platform modernizes electoral processes, eliminates traditional barriers to registration, and ensures the integrity of voter data while building the technological foundation necessary to support transparent, accessible elections that advance our nation's democratic progress.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                  onClick={() => router.push('/auth?tab=sign-up')}
                >
                  REGISTER WITH VRAMS
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" className="border-white text-blue-900 hover:bg-white/10 px-8 py-6 text-lg font-bold">
                  HOW VRAMS WORKS
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-300" />
                  <span>Save Time</span>
                </div>
                <div className="h-4 w-px bg-white/30"></div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-yellow-300" />
                  <span>Skip the Lines</span>
                </div>
              </div>
            </div>

            {/* 3-Step Process Visualization - Animated */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse",
                  repeatDelay: 3
                }
              }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 w-full max-w-md"
            >
              <motion.h3 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: {
                    delay: 0.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 3
                  }
                }}
                className="text-xl font-bold mb-6 text-center text-yellow-300"
              >
                Registration in 3 Simple Steps
              </motion.h3>
              
              <div className="space-y-6">
                {[
                  {
                    number: "1",
                    title: "Complete Application",
                    description: "Fill out the online form (2 minutes)"
                  },
                  {
                    number: "2",
                    title: "Verify Identity",
                    description: "Upload required documents (Instant)"
                  },
                  {
                    number: "3", 
                    title: "Ready to Vote",
                    description: "Receive confirmation for 2025 Elections"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        duration: 0.5,
                        delay: index * 0.15 + 0.3,
                        repeat: Infinity,
                        repeatType: "reverse",
                        repeatDelay: 3
                      }
                    }}
                    className="flex items-start gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        scale: [1, 1.05, 1],
                        transition: {
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 1
                        }
                      }}
                      className="bg-yellow-400 text-blue-900 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0 mt-1"
                    >
                      <span className="font-bold">{step.number}</span>
                    </motion.div>
                    <div>
                      <h4 className="font-bold text-lg">{step.title}</h4>
                      <p className="text-blue-100">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="dates" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-blue-900">
            <span className="border-b-4 border-yellow-400 pb-2">KEY DATES</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {registrationTimeline.map((item, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-white rounded-lg shadow-lg p-6 h-full border border-gray-200 hover:border-yellow-300 transition-colors">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-900 text-white p-3 rounded-lg text-center min-w-[80px]">
                      <div className="text-xl font-bold">{item.date}</div>
                      <div className="text-xs">{item.year}</div>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">{item.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                    <Calendar className="h-4 w-4 mr-2" />
                    Add to calendar
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-blue-900">
            WHY REGISTER WITH VRAMS?
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Experience the future of democratic participation with our secure platform.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-8 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="bg-blue-100 text-blue-900 p-3 rounded-full w-fit mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section id="requirements" className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            <span className="border-b-4 border-yellow-400 pb-2">REQUIREMENTS</span>
          </h2>
          <p className="text-blue-200 text-center max-w-2xl mx-auto mb-16">
            What you need to prepare for your voter registration
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {requirements.map((requirement, index) => (
              <div key={index} className="bg-blue-800 rounded-xl p-6 hover:bg-blue-700 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-yellow-400 text-blue-900 p-3 rounded-full">
                    <requirement.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">{requirement.title}</h3>
                </div>
                <ul className="space-y-3">
                  {requirement.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-800 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">READY TO EXERCISE YOUR RIGHT TO VOTE?</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
            Because in a democracy, every vote counts — and every voter matters.
          </p>
          <Button 
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 px-12 py-6 text-lg font-bold shadow-lg"
            onClick={() => router.push('/auth?tab=sign-up')}
          >
            START REGISTRATION
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoSrc} alt="VRAMS Logo" className="h-10 w-10" />
                <span className="text-xl font-bold">VRAMS</span>
              </div>
              <p className="text-blue-200">
                Modernizing Philippine voter registration with secure, accessible technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Registration</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Requirements</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2 text-blue-200">
                <li><a href="#" className="hover:text-white transition-colors">Download Forms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Voting Centers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Election Calendar</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact COMELEC</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Contact</h3>
              <address className="not-italic text-blue-200 space-y-2">
                <p>COMELEC Main Office</p>
                <p>info@vrams.gov.ph</p>
                <p>(02) 1234-5678</p>
              </address>
            </div>
          </div>
          
          <div className="border-t border-blue-800 mt-12 pt-8 text-center text-blue-300">
            <p>© {new Date().getFullYear()} Voter Registration and Application Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
