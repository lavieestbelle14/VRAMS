
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ApplicationDataTable } from '@/components/dashboard/ApplicationDataTable';
import { 
  ArrowLeft, Download, RefreshCw, Filter, Search, 
  Files, Clock, CheckCircle, XCircle, FileText,
  Users, BarChart3, Calendar
} from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import type { Application } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AllApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      // Use the same query structure as the dashboard
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
          ),
          application_registration (
            registration_type,
            adult_registration_consent,
            government_id_front_url,
            government_id_back_url,
            id_selfie_url
          )
        `)
        .order('application_date', { ascending: false });

      if (error) throw error;
      
      // Map DB data to Application type (same as dashboard)
      const mapped: Application[] = (data || []).map((app: any) => {
        const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
        const address = Array.isArray(app.application_declared_address) ? app.application_declared_address[0] : app.application_declared_address;
        const registration = Array.isArray(app.application_registration) ? app.application_registration[0] : app.application_registration;

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
            motherLastName: applicant?.mother_maiden_name?.split(' ').slice(1).join(' ') || ''
          },
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
    } catch (error) {
      console.error('Error loading applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Calculate statistics
  const statistics = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(app => app.status === 'pending').length;
    const verified = applications.filter(app => app.status === 'verified').length;
    const approved = applications.filter(app => app.status === 'approved').length;
    const disapproved = applications.filter(app => app.status === 'disapproved').length;
    
    return { total, pending, verified, approved, disapproved };
  }, [applications]);

  const exportApplicationsToCSV = (applications: Application[]) => {
    if (!applications.length) {
      toast({
        title: "No Data",
        description: "No applications to export.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      'ID', 'First Name', 'Last Name', 'Birth Date', 'Email', 'Contact Number',
      'Current Address', 'Application Type', 'Status', 'Submission Date'
    ];

    const csvContent = [
      headers.join(','),
      ...applications.map(app => [
        app.id,
        app.personalInfo.firstName,
        app.personalInfo.lastName,
        app.personalInfo.dob,
        app.personalInfo.email || '',
        app.personalInfo.contactNumber || '',
        `"${app.addressDetails.houseNoStreet}, ${app.addressDetails.barangay}, ${app.addressDetails.cityMunicipality}, ${app.addressDetails.province}"`,
        app.applicationType,
        app.status,
        app.submissionDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `applications-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Application data has been exported to CSV.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      {/* Enhanced Header Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Files className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">All Applications</h2>
            <p className="text-muted-foreground">
              Comprehensive management of all voter registration applications
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportApplicationsToCSV(applications)}
            disabled={applications.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadApplications}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Enhanced Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-primary bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{statistics.total}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                All Submissions
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.pending}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                Awaiting Review
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
            <div className="text-2xl font-bold">{statistics.verified}</div>
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
            <div className="text-2xl font-bold">{statistics.approved}</div>
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
            <div className="text-2xl font-bold">{statistics.disapproved}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
                Failed Requirements
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Application Management Section */}
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center text-xl">Application Management</CardTitle>
                <CardDescription className="mt-1">
                  Complete list with advanced filtering, search, and export capabilities
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {statistics.total} Total Records
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ApplicationDataTable applications={applications} />
        </CardContent>
      </Card>
    </div>
  );
}
