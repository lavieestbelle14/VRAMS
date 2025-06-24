'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationDataTable } from '@/components/dashboard/ApplicationDataTable';
import { 
  Files, BarChart3, PieChartIcon, RefreshCw, Download, 
  Filter, Search, Bell, FileText, ShieldCheck, Calendar, 
  CheckCircle, XCircle, Clock, AlertCircle, HelpCircle
} from 'lucide-react';

import { useEffect, useState, useMemo } from 'react';
import type { Application } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend as RechartsLegend, Cell, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval, startOfDay, isSameDay, parseISO } from 'date-fns';
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/lib/supabase/client';

function exportApplicationsToCSV(applications: Application[], filename: string) {
  if (!applications.length) {
    alert("No data to export.");
    return;
  }

  const headers = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'Application Type',
    'Status',
    'Submission Date',
    'Last Updated',
    'Remarks'
  ];


  const escapeCsvValue = (value: string | undefined | null): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.join(','),
    ...applications.map(app => [
      escapeCsvValue(app.id),
      escapeCsvValue(app.personalInfo.firstName),
      escapeCsvValue(app.personalInfo.lastName),
      escapeCsvValue(app.personalInfo.email),
      escapeCsvValue(app.personalInfo.contactNumber || ''),
      escapeCsvValue(app.applicationType),
      escapeCsvValue(app.status),
      escapeCsvValue(format(parseISO(app.submissionDate), 'yyyy-MM-dd HH:mm:ss')),
      escapeCsvValue(app.remarks)
    ].join(','))
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const { toast } = useToast();

  // Fetch applications from Supabase
  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Fetch applications with applicant and address info
      const { data, error } = await supabase
        .from('application')
        .select(`
          application_number,
          public_facing_id,
          application_type,
          application_date,
          processing_date,
          status,
          remarks,
          applicant:applicant_id (
            first_name,
            last_name,
            middle_name,
            suffix,
            sex,
            date_of_birth,
            civil_status,
            contact_number,
            email_address,
            profession_occupation,
            citizenship_type,
            father_name,
            mother_maiden_name,
            spouse_name
          ),
          application_declared_address (
            house_number_street,
            barangay,
            city_municipality,
            province,
            months_of_residence_address,
            years_of_residence_address,
            months_of_residence_municipality,
            years_of_residence_municipality,
            years_in_country
          ),          application_registration (
            registration_type,
            adult_registration_consent,
            government_id_front_url,
            government_id_back_url,
            id_selfie_url
          ),
          application_transfer (
            previous_precinct_number,
            previous_barangay,
            previous_city_municipality,
            previous_province,
            previous_foreign_post,
            previous_country,
            transfer_type
          ),
          application_reactivation (
            reason_for_deactivation
          ),
          application_correction (
            target_field,
            requested_value,
            current_value
          ),
          application_reinstatement (
            reinstatement_type
          )
        `)
        .order('application_date', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } else {        // Map DB data to Application type
        const mapped: Application[] = (data || []).map((app: any) => {
          const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
          const address = Array.isArray(app.application_declared_address) ? app.application_declared_address[0] : app.application_declared_address;
          const registration = Array.isArray(app.application_registration) ? app.application_registration[0] : app.application_registration;
          const transfer = Array.isArray(app.application_transfer) ? app.application_transfer[0] : app.application_transfer;
          const reactivation = Array.isArray(app.application_reactivation) ? app.application_reactivation[0] : app.application_reactivation;
          const correction = Array.isArray(app.application_correction) ? app.application_correction[0] : app.application_correction;
          const reinstatement = Array.isArray(app.application_reinstatement) ? app.application_reinstatement[0] : app.application_reinstatement;

          return {
            id: app.public_facing_id || `APP-${String(app.application_number).padStart(6, '0')}`,
            applicationType: app.application_type,
            status: app.status,
            submissionDate: app.application_date,
            remarks: app.remarks || '',
            personalInfo: {
              firstName: applicant?.first_name || '',
              lastName: applicant?.last_name || '',
              middleName: applicant?.middle_name || '',
              suffix: applicant?.suffix || '',
              sex: applicant?.sex || '',
              dob: applicant?.date_of_birth || '',
              birthDate: applicant?.date_of_birth || '',
              civilStatus: applicant?.civil_status || '',
              mobileNumber: applicant?.contact_number || '',
              phoneNumber: applicant?.contact_number || '',
              contactNumber: applicant?.contact_number || '',
              email: applicant?.email_address || '',
              fatherFirstName: applicant?.father_name?.split(' ')[0] || '',
              fatherLastName: applicant?.father_name?.split(' ').slice(1).join(' ') || '',
              motherFirstName: applicant?.mother_maiden_name?.split(' ')[0] || '',
              motherLastName: applicant?.mother_maiden_name?.split(' ').slice(1).join(' ') || '',
              spouseName: applicant?.spouse_name || '',
              isPwd: false,
              isSenior: false,
              isIndigenousPerson: false,
              indigenousTribe: '',
              isIlliterate: false,
              placeOfBirthProvince: '',
              citizenshipType: applicant?.citizenship_type || '',
              professionOccupation: applicant?.profession_occupation || '',
              residencyYearsCityMun: address?.years_of_residence_municipality || 0,
              residencyMonthsCityMun: address?.months_of_residence_municipality || 0,
              residencyYearsPhilippines: address?.years_in_country || 0
            },
            addressInfo: {
              houseNoStreet: address?.house_number_street || '',
              barangay: address?.barangay || '',
              cityMunicipality: address?.city_municipality || '',
              province: address?.province || ''
            },
            addressDetails: {
              houseNoStreet: address?.house_number_street || '',
              barangay: address?.barangay || '',
              cityMunicipality: address?.city_municipality || '',
              province: address?.province || '',
              zipCode: '',
              yearsOfResidency: address?.years_of_residence_address || 0,
              monthsOfResidency: address?.months_of_residence_address || 0
            },
            civilDetails: {
              civilStatus: applicant?.civil_status || '',
              fatherFirstName: applicant?.father_name?.split(' ')[0] || '',
              fatherLastName: applicant?.father_name?.split(' ').slice(1).join(' ') || '',
              motherFirstName: applicant?.mother_maiden_name?.split(' ')[0] || '',
              motherLastName: applicant?.mother_maiden_name?.split(' ').slice(1).join(' ') || ''            },
            
            // Application type-specific data
            registration: registration ? {
              registrationType: registration.registration_type || 'Regular',
              adultRegistrationConsent: registration.adult_registration_consent,
              governmentIdFrontUrl: registration.government_id_front_url || '',
              governmentIdBackUrl: registration.government_id_back_url || '',
              idSelfieUrl: registration.id_selfie_url || ''
            } : undefined,
            
            transfer: transfer ? {
              previousPrecinctNumber: transfer.previous_precinct_number,
              previousBarangay: transfer.previous_barangay,
              previousCityMunicipality: transfer.previous_city_municipality,
              previousProvince: transfer.previous_province,
              previousForeignPost: transfer.previous_foreign_post,
              previousCountry: transfer.previous_country,
              transferType: transfer.transfer_type
            } : undefined,
            
            reactivation: reactivation ? {
              reasonForDeactivation: reactivation.reason_for_deactivation
            } : undefined,
            
            correction: correction ? {
              targetField: correction.target_field,
              requestedValue: correction.requested_value,
              currentValue: correction.current_value
            } : undefined,
            
            reinstatement: reinstatement ? {
              reinstatementType: reinstatement.reinstatement_type
            } : undefined,
            
            documents: [
              ...(registration?.government_id_front_url ? [{
                name: 'Government ID (Front)',
                url: registration.government_id_front_url,
                type: 'government_id_front' as const,
                uploadDate: app.application_date
              }] : []),
              ...(registration?.government_id_back_url ? [{
                name: 'Government ID (Back)',
                url: registration.government_id_back_url,
                type: 'government_id_back' as const,
                uploadDate: app.application_date
              }] : []),
              ...(registration?.id_selfie_url ? [{
                name: 'ID Selfie',
                url: registration.id_selfie_url,
                type: 'id_selfie' as const,
                uploadDate: app.application_date
              }] : [])
            ],
          };
        });
        setApplications(mapped);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const refreshData = () => {
    fetchApplications();
  };

  const handleExportData = () => {
    if (applications.length === 0) {
      toast({
        title: "No Data to Export",
        description: "The current view has no applications to export.",
        variant: "destructive",
      });
      return;
    }
    const date = format(new Date(), 'yyyy-MM-dd');
    exportApplicationsToCSV(applications, `voter-applications-${date}`);
    toast({
      title: "Export Started",
      description: `${applications.length} records are being downloaded.`,
    });
  };

  const handleIdReview = (application: Application) => {
    setSelectedApp(application);
    setVerificationNotes(application.remarks || '');
  };

  

  const summaryCounts = useMemo(() => {
    return applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      
      if (app.documents && app.documents.length > 0) {
        acc.withId = (acc.withId || 0) + 1;
      }
      
      return acc;
    }, { pending: 0, verified: 0, approved: 0, disapproved: 0, total: 0, withId: 0 } as Record<string, number>);
  }, [applications]);

  const statusChartData = useMemo(() => {
  return [
    { name: 'Pending', value: summaryCounts.pending, fill: 'hsl(45, 93%, 47%)' }, // matches amber-500
    { name: 'Verified', value: summaryCounts.verified, fill: 'hsl(217, 91%, 60%)' }, // matches blue-500
    { name: 'Approved', value: summaryCounts.approved, fill: 'hsl(142, 76%, 36%)' }, // matches green-500
    { name: 'Disapproved', value: summaryCounts.disapproved, fill: 'hsl(0, 84%, 60%)' }, // matches red-500
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

  } satisfies import("@/components/ui/chart").ChartConfig;

  const submissionsChartConfig = {
    count: { label: "Submissions", color: "hsl(var(--primary))" },
  } satisfies import("@/components/ui/chart").ChartConfig;

  const completionPercentage = useMemo(() => {
    const total = summaryCounts.total;
    if (total === 0) return 0;
    return Math.round(((summaryCounts.approved || 0) + (summaryCounts.disapproved || 0)) / total * 100);
  }, [summaryCounts]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-amber-500" />;
      case 'verified': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disapproved': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Officer Dashboard</h2>
          <p className="text-muted-foreground">
            Manage and track voter registrations efficiently
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Bell className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-auto">
                <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-md">
                  <div className="mt-1 bg-blue-100 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New application submitted</p>
                    <p className="text-xs text-muted-foreground">Juan Dela Cruz has submitted a new application</p>
                    <p className="text-xs text-muted-foreground mt-1">Just now</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-md">
                  <div className="mt-1 bg-green-100 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application approved</p>
                    <p className="text-xs text-muted-foreground">You approved Maria Santos's application</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={refreshData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Total Applications Overview - Prominent Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Files className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Total Applications</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Overall application statistics and completion tracking</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{summaryCounts.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Submissions</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="bg-white/60 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Completion Rate:</span>
                  <span className="text-lg font-bold text-green-600">{completionPercentage}%</span>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Progress value={completionPercentage} className="h-3" />
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div className="font-medium">{summaryCounts.approved + summaryCounts.disapproved}</div>
                <div className="text-xs">of {summaryCounts.total} processed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.pending}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                Awaiting Officer Review
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <FileText className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.verified}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                Ready for Decision
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.approved}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Successfully Verified
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disapproved</CardTitle>
            <XCircle className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryCounts.disapproved}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                Failed Requirements
              </Badge>
            </div>
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
              <ChartContainer config={statusChartConfig} className="mx-auto aspect-rectangle max-h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                  <Pie 
                    data={statusChartData} 
                    dataKey="value" 
                    nameKey="name" 
                    labelLine={false} 
                    label={({ percent, name }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center text-lg"><BarChart3 className="mr-2 h-5 w-5"/>Weekly Application Trend</CardTitle>
            <CardDescription>Number of applications submitted daily</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={submissionsChartConfig} className="h-[250px] w-full">
              <BarChart data={submissionsLast7DaysData} accessibilityLayer>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis allowDecimals={false} />
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const weeklyTotal = submissionsLast7DaysData.reduce((sum, item) => sum + item.count, 0);
                      const percentage = weeklyTotal > 0 ? Math.round((data.count / weeklyTotal) * 100) : 0;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-sm">{data.date}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Applications
                              </span>
                              <span className="font-bold text-sm">
                                {data.count} <span className="font-normal text-muted-foreground">({percentage}%)</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--color-count)" 
                  radius={[4, 4, 0, 0]} 
                  barSize={30}
                  label={({ x, y, width, value }) => {
                    const weeklyTotal = submissionsLast7DaysData.reduce((sum, item) => sum + item.count, 0);
                    const percentage = weeklyTotal > 0 ? Math.round((value / weeklyTotal) * 100) : 0;
                    return (
                      <text 
                        x={x + width / 2} 
                        y={y - 8} 
                        fill="#6b7280" 
                        textAnchor="middle" 
                        dominantBaseline="middle"
                        className="text-xs"
                      >
                        {percentage > 0 ? `${percentage}%` : ''}
                      </text>
                    );
                  }}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Calendar className="mr-2 h-5 w-5"/>Recent Activities
            </CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </div>
          <CardDescription>Latest actions and application submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.slice(0, 3).map((app, index) => (
              <div key={index} className="flex items-start gap-4 border-b pb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {app.personalInfo.firstName[0]}{app.personalInfo.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium">
                      {app.personalInfo.firstName} {app.personalInfo.lastName}
                    </p>
                    <Badge className="capitalize">{app.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Application ID: {app.id}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted on {format(parseISO(app.submissionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(app.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

