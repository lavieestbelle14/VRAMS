
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationDataTable } from '@/components/dashboard/ApplicationDataTable';
import { Files, BarChart3, PieChartIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Application } from '@/types';
import { getApplications, seedInitialData } from '@/lib/applicationStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell, CartesianGrid } from 'recharts'; // Added CartesianGrid
import { format, subDays, eachDayOfInterval, startOfDay, isSameDay } from 'date-fns';

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    seedInitialData(); 
    setApplications(getApplications());
    setIsLoading(false);
  }, []);

  const summaryCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0, reviewing: 0, total: 0 } as Record<Application['status'] | 'total', number>);
  }, [applications]);

  const statusChartData = useMemo(() => {
    return [
      { name: 'Pending', value: summaryCounts.pending, fill: 'hsl(var(--chart-1))' },
      { name: 'Reviewing', value: summaryCounts.reviewing, fill: 'hsl(var(--chart-2))' },
      { name: 'Approved', value: summaryCounts.approved, fill: 'hsl(var(--chart-3))' },
      { name: 'Rejected', value: summaryCounts.rejected, fill: 'hsl(var(--chart-4))' },
    ].filter(item => item.value > 0);
  }, [summaryCounts]);

  const submissionsLast7DaysData = useMemo(() => {
    const today = startOfDay(new Date());
    const last7Days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });

    return last7Days.map(day => {
      const count = applications.filter(app => isSameDay(parseISO(app.submissionDate), day)).length;
      return {
        date: format(day, 'MMM dd'),
        count: count,
      };
    });
  }, [applications]);
  
  const statusChartConfig = {
    value: { label: "Applications" },
    pending: { label: "Pending", color: "hsl(var(--chart-1))" },
    reviewing: { label: "Reviewing", color: "hsl(var(--chart-2))" },
    approved: { label: "Approved", color: "hsl(var(--chart-3))" },
    rejected: { label: "Rejected", color: "hsl(var(--chart-4))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  const submissionsChartConfig = {
    count: { label: "Submissions", color: "hsl(var(--primary))" },
  } satisfies import("@/components/ui/chart").ChartConfig;


  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Officer Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and track voter applications efficiently.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.total}</div>
            <p className="text-xs text-muted-foreground">All submitted applications</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.pending}</div>
             <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.approved}</div>
             <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.rejected}</div>
            <p className="text-xs text-muted-foreground">Did not meet requirements</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><PieChartIcon className="mr-2 h-5 w-5"/>Applications by Status</CardTitle>
            <CardDescription>Distribution of current application statuses.</CardDescription>
          </CardHeader>
          <CardContent>
            {statusChartData.length > 0 ? (
              <ChartContainer config={statusChartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie data={statusChartData} dataKey="value" nameKey="name" labelLine={false} label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                     {statusChartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground">No data available for status chart.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5"/>Submissions - Last 7 Days</CardTitle>
            <CardDescription>Number of applications submitted daily.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={submissionsChartConfig} className="h-[250px] w-full">
              <BarChart data={submissionsLast7DaysData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Application Management</CardTitle>
          <CardDescription>Filter, sort, and manage all voter applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationDataTable applications={applications} />
        </CardContent>
      </Card>
    </div>
  );
}

function parseISO(dateString: string): Date {
    const date = new Date(dateString);
    return date;
}

