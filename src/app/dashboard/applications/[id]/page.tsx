
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Application } from '@/types';
import { getApplicationById, updateApplicationStatus } from '@/lib/applicationStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Edit, FileText, User, MapPin, CalendarDays, Briefcase, Accessibility, Save, XCircle, MessageSquare, Building, Users, ShieldCheck } from 'lucide-react'; // Removed ListChecks, Edit3, RefreshCcw
import { format } from 'date-fns';

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      const appData = getApplicationById(id);
      if (appData) {
        setApplication(appData);
        setRemarks(appData.remarks || '');
      }
      setIsLoading(false);
    }
  }, [id]);

  const handleStatusUpdate = (newStatus: Application['status']) => {
    if (!application) return;
    const updatedApp = updateApplicationStatus(application.id, newStatus, remarks);
    if (updatedApp) {
      setApplication(updatedApp); 
      toast({
        title: `Application ${newStatus}`,
        description: `Application ID ${updatedApp.id} has been ${newStatus}.`,
      });
    } else {
       toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };
  
  const DetailItem = ({ label, value, icon, isBoolean = false }: { label: string; value?: string | number | null | boolean | string[]; icon?: React.ElementType; isBoolean?: boolean }) => {
    const IconComponent = icon;
    if (value === null || typeof value === 'undefined' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) ) return null;
    
    let displayValue = String(value);
    if (isBoolean) {
        displayValue = value ? 'Yes' : 'No';
    } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
    }

    return (
      <div className="mb-2">
        <Label className="text-sm font-semibold text-muted-foreground flex items-center">
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />} {label}
        </Label>
        <p className="text-sm">{displayValue}</p>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg></div>;
  }

  if (!application) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Application Not Found</h2>
        <p className="text-muted-foreground">The requested application ID ({id}) could not be found.</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
      </div>
    );
  }
  
  const { personalInfo: pi, addressDetails: ad, civilDetails: cd, specialNeeds: sn, oldAddressDetails: oad } = application;

  const applicationTypeLabels: Record<Application['applicationType'] | '', string> = {
      'register': 'New Registration',
      'transfer': 'Transfer of Registration',
      // REMOVED: reactivation, changeCorrection, inclusionReinstatement
      '': 'Unknown Type'
  };
  // REMOVED: const reactivationReasonLabels = { ... };

  const getStatusBadgeVariant = (status: Application['status']) => {
    switch (status) {
      case 'approved': return 'default'; 
      case 'rejected': return 'destructive'; 
      case 'pending': return 'secondary'; 
      case 'reviewing': return 'outline'; 
      default: return 'secondary';
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
      </Button>

      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Application Details - {application.id}</CardTitle>
            <CardDescription>
              Submitted on: {format(new Date(application.submissionDate), 'PPP p')}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(application.status)} className="text-lg capitalize">
            {application.status}
          </Badge>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center"><User className="mr-2"/>Personal Information</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Full Name" value={`${pi.firstName} ${pi.middleName || ''} ${pi.lastName}`} />
              <DetailItem label="Sex" value={pi.sex} />
              <DetailItem label="Date of Birth" value={format(new Date(pi.dob), 'PPP')} />
              <DetailItem label="Place of Birth (City/Mun)" value={pi.placeOfBirthCityMun} />
              <DetailItem label="Place of Birth (Province)" value={pi.placeOfBirthProvince} />
              <DetailItem label="Contact Number" value={pi.contactNumber} />
              <DetailItem label="Email" value={pi.email} />
              <DetailItem label="Profession/Occupation" value={pi.professionOccupation} icon={Briefcase}/>
              <DetailItem label="TIN" value={pi.tin} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center"><ShieldCheck className="mr-2"/>Citizenship</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Citizenship Basis" value={pi.citizenshipType} />
              {(pi.citizenshipType === 'naturalized' || pi.citizenshipType === 'reacquired') && (
                <>
                  <DetailItem label="Naturalization/Reacquisition Date" value={pi.naturalizationDate ? format(new Date(pi.naturalizationDate), 'PPP') : 'N/A'} />
                  <DetailItem label="Certificate No./Order of Approval" value={pi.naturalizationCertNo} />
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><MapPin className="mr-2"/>Current Address</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Address" value={`${ad.houseNoStreet}, ${ad.barangay}, ${ad.cityMunicipality}, ${ad.province}, ${ad.zipCode}`} />
              <DetailItem label="Years at Current Address" value={ad.yearsOfResidency} />
              <DetailItem label="Months at Current Address" value={ad.monthsOfResidency} />
            </CardContent>
          </Card>

           <Card>
            <CardHeader><CardTitle className="flex items-center"><Building className="mr-2"/>Period of Residence</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Years in City/Municipality" value={pi.residencyYearsCityMun} />
              <DetailItem label="Months in City/Municipality" value={pi.residencyMonthsCityMun} />
              <DetailItem label="Years in Philippines" value={pi.residencyYearsPhilippines} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Users className="mr-2"/>Civil & Family Details</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Civil Status" value={cd.civilStatus} />
              {cd.civilStatus === 'married' && <DetailItem label="Spouse's Name" value={cd.spouseName} />}
              <DetailItem label="Father's Full Name" value={`${cd.fatherFirstName} ${cd.fatherLastName}`} />
              <DetailItem label="Mother's Full Name" value={`${cd.motherFirstName} ${cd.motherLastName}`} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Application Type & Biometrics</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Application Type" value={applicationTypeLabels[application.applicationType || '']} />
              <DetailItem label="Biometrics Data Status" value={application.biometricsFile || 'N/A'} />
            </CardContent>
          </Card>

          {application.applicationType === 'transfer' && oad && (
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center"><MapPin className="mr-2 text-orange-500"/>Previous Address (Transfer)</CardTitle></CardHeader>
              <CardContent>
                <DetailItem label="Old Address" value={`${oad.houseNoStreet}, ${oad.barangay}, ${oad.cityMunicipality}, ${oad.province}, ${oad.zipCode}`} />
              </CardContent>
            </Card>
          )}

          {/* REMOVED Conditional display for Reactivation Details */}
          {/* REMOVED Conditional display for Change/Correction Details */}
          {/* REMOVED Conditional display for Inclusion/Reinstatement Details */}

          {sn && (Object.values(sn).some(v => v) || sn.assistorName) && (
             <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="flex items-center"><Accessibility className="mr-2"/>Special Needs & Assistance</CardTitle></CardHeader>
                <CardContent>
                    <DetailItem label="Illiterate" value={sn.isIlliterate} isBoolean/>
                    <DetailItem label="Senior Citizen" value={sn.isSenior} isBoolean />
                    <DetailItem label="PWD" value={sn.isPwd} isBoolean />
                    {sn.isPwd && <DetailItem label="Disability Type" value={sn.disabilityType} />}
                    <DetailItem label="Indigenous Person" value={sn.isIndigenousPerson} isBoolean/>
                    <DetailItem label="Assistor's Name" value={sn.assistorName} />
                    <DetailItem label="Assistor's Relationship" value={sn.assistorRelationship} />
                    <DetailItem label="Assistor's Address" value={sn.assistorAddress} />
                    <DetailItem label="Prefers Ground Floor Voting" value={sn.prefersGroundFloor} isBoolean />
                </CardContent>
            </Card>
          )}
          
          {(application.status === 'approved' || application.status === 'rejected' || application.remarks) && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><MessageSquare className="mr-2"/>Officer Remarks & Outcome</CardTitle></CardHeader>
              <CardContent>
                {application.status === 'approved' && (
                  <>
                    <DetailItem label="Voter ID" value={application.voterId} icon={CheckCircle} />
                    <DetailItem label="Precinct No." value={application.precinct} icon={MapPin} />
                    <DetailItem label="Approval Date" value={application.approvalDate ? format(new Date(application.approvalDate), 'PPP p') : 'N/A'} icon={CalendarDays} />
                  </>
                )}
                <DetailItem label="Officer Remarks" value={application.remarks || (application.status === 'approved' ? 'Application Approved.' : 'No remarks provided.')} />
              </CardContent>
            </Card>
          )}
        </CardContent>

        {(application.status === 'pending' || application.status === 'reviewing') ? (
          <CardFooter className="flex-col items-start space-y-4 pt-6 border-t">
             <div>
                <Label htmlFor="remarks" className="text-lg font-semibold">Add/Update Remarks</Label>
                <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks for approval or rejection..."
                    className="mt-2 min-h-[100px]"
                />
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleStatusUpdate('approved')} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button onClick={() => handleStatusUpdate('rejected')} variant="destructive">
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
              {application.status === 'pending' && (
                 <Button onClick={() => handleStatusUpdate('reviewing')} variant="outline">
                    <Edit className="mr-2 h-4 w-4" /> Mark as Reviewing
                </Button>
              )}
            </div>
          </CardFooter>
        ) : null}
      </Card>
    </div>
  );
}
