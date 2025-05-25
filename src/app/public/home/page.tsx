
'use client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Ticket, Info } from 'lucide-react';

export default function PublicHomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Public User!</h1>
        {user?.username && <p className="text-muted-foreground mt-1">Logged in as: {user.username}</p>}
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="mr-2 h-6 w-6 text-primary" />
            Application Status
          </CardTitle>
          <CardDescription>
            The ability to track your voter registration application status will be available here soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We are working hard to bring you a seamless experience to check the progress of your application.
            Please check back later for updates.
          </p>
          <div className="bg-accent/20 p-4 rounded-md border border-accent/50">
            <h3 className="font-semibold text-accent-foreground flex items-center">
              <Ticket className="mr-2 h-5 w-5"/>
              Future Feature: Application Status Tracker
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Once launched, you will be able to enter your application reference number to view its current status.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
