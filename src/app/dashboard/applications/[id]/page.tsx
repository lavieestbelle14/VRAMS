'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApplicationByPublicId } from '@/services/applicationService';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Edit, FileText, User, MapPin, CalendarDays, Briefcase, Accessibility, Save, XCircle, MessageSquare, Building, Users, ShieldCheck, Trash2, Clock, CreditCard, Camera, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";

type IdVerificationDialogProps = {
  imageUrl: string;
  title: string;
  description: string;
};

function IdVerificationDialog({ imageUrl, title, description }: IdVerificationDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <p className="text-sm text-blue-600 cursor-pointer hover:underline">
          View Image
        </p>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative w-full h-[400px] mt-4">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ApplicationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [application, setApplication] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ url: string; label: string } | null>(null);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      getApplicationByPublicId(id)
        .then(appData => {
          if (appData) {
            setApplication(appData);
            setRemarks(appData.remarks || '');
          } else {
            setApplication(null);
          }
        })
        .catch(e => {
          setError('Failed to fetch application details.');
          setApplication(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleStatusUpdate = (newStatus: Application['status']) => {
    if (!application) return;
    const updatedApp = updateApplicationStatus(application.id, newStatus, remarks);
    if (updatedApp) {
      setApplication(updatedApp); 
      toast({
        title: `Application ${newStatus.replace(/([A-Z])/g, ' $1').trim()}`,
        description: `Application ID ${updatedApp.id} has been updated.`,
      });
    } else {
       toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  const handleDeleteApplication = () => {
    if (!application) return;
    const success = deleteApplicationById(application.id);
    if (success) {
      toast({ title: "Application Deleted", description: `Application ID ${application.id} has been deleted.` });
      router.push('/dashboard/applications');
    } else {
      toast({ title: "Error", description: "Failed to delete application.", variant: "destructive" });
    }
    setShowDeleteDialog(false);
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

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.back()} className="mt-4"><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
      </div>
    );
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

  // Map application fields for display
  const pi = {
    firstName: application.firstName,
    middleName: application.middleName,
    lastName: application.lastName,
    sex: application.sex,
    dob: application.dateOfBirth,
    placeOfBirthCityMun: application.placeOfBirthMunicipality,
    placeOfBirthProvince: application.placeOfBirthProvince,
    contactNumber: application.contactNumber,
    email: application.emailAddress,
    professionOccupation: application.professionOccupation,
    tin: application.tin,
    citizenshipType: application.citizenshipType,
    naturalizationDate: application.dateOfNaturalization,
    naturalizationCertNo: application.certificateNumber,
    residencyYearsCityMun: application.yearsOfResidenceMunicipality,
    residencyMonthsCityMun: application.monthsOfResidenceMunicipality,
    residencyYearsPhilippines: application.yearsInCountry,
  };
  const ad = {
    houseNoStreet: `${application.houseNumber || ''} ${application.street || ''}`.trim(),
    barangay: application.barangay,
    cityMunicipality: application.cityMunicipality,
    province: application.province,
    zipCode: '',
    yearsOfResidency: application.yearsOfResidenceAddress,
    monthsOfResidency: application.monthsOfResidenceAddress,
  };
  const cd = {
    civilStatus: application.civilStatus,
    spouseName: application.spouseName,
    fatherFirstName: application.fatherFirstName,
    fatherLastName: application.fatherLastName,
    motherFirstName: application.motherFirstName,
    motherLastName: application.motherMaidenLastName,
  };
  // Special needs and other sections can be mapped similarly if needed

  // Application type labels (expanded for all types)
  const applicationTypeLabels: Record<
    '' | 'register' | 'transfer' | 'reactivation' | 'transfer_with_reactivation' | 'correction_of_entry' | 'reinstatement',
    string
  > = {
    'register': 'New Registration',
    'transfer': 'Transfer of Registration',
    'reactivation': 'Reactivation',
    'transfer_with_reactivation': 'Transfer with Reactivation',
    'correction_of_entry': 'Correction of Entry',
    'reinstatement': 'Reinstatement',
    '': 'Unknown Type',
  };

  // Status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'rejected': return 'destructive';
      case 'pending': return 'secondary';
      case 'reviewing': return 'outline';
      default: return 'secondary';
    }
  };

  // Only show actions for actionable statuses
  const isActionable = ['pending', 'reviewing'].includes(application.status);
  const showApprovalOutcome = ['approved', 'rejected'].includes(application.status) || application.remarks;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Applications
        </Button>
        {/* Delete logic can be implemented if needed */}
      </div>
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Application Details - {application.id}</CardTitle>
            <CardDescription>
              Submitted on: {application.submissionDate ? format(new Date(application.submissionDate), 'PPP p') : 'N/A'}
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
              <DetailItem label="Date of Birth" value={pi.dob ? format(new Date(pi.dob), 'PPP') : ''} />
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
              {(pi.citizenshipType === 'Naturalized' || pi.citizenshipType === 'Reacquired') && (
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
              <DetailItem label="Address" value={`${ad.houseNoStreet}, ${ad.barangay}, ${ad.cityMunicipality}, ${ad.province}`} />
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
              {cd.civilStatus === 'Married' && <DetailItem label="Spouse's Name" value={cd.spouseName} />}
              <DetailItem label="Father's Full Name" value={`${cd.fatherFirstName} ${cd.fatherLastName}`} />
              <DetailItem label="Mother's Full Name" value={`${cd.motherFirstName} ${cd.motherLastName}`} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Application Type</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Application Type" value={applicationTypeLabels[application.applicationType || '']} />
            </CardContent>
          </Card>
          {application.applicationType === 'register' && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>ID & Selfie Preview</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-8">
                  {application.governmentIdFrontUrl && (
                    <div>
                      <div className="font-semibold mb-1">Front ID</div>
                      <Image
                        src={application.governmentIdFrontUrl}
                        alt="Front ID"
                        width={220}
                        height={140}
                        className="rounded border cursor-pointer hover:opacity-80"
                        onClick={() => setPreviewImage({ url: application.governmentIdFrontUrl, label: 'Front ID' })}
                      />
                    </div>
                  )}
                  {application.governmentIdBackUrl && (
                    <div>
                      <div className="font-semibold mb-1">Back ID</div>
                      <Image
                        src={application.governmentIdBackUrl}
                        alt="Back ID"
                        width={220}
                        height={140}
                        className="rounded border cursor-pointer hover:opacity-80"
                        onClick={() => setPreviewImage({ url: application.governmentIdBackUrl, label: 'Back ID' })}
                      />
                    </div>
                  )}
                  {application.idSelfieUrl && (
                    <div>
                      <div className="font-semibold mb-1">Selfie with ID</div>
                      <Image
                        src={application.idSelfieUrl}
                        alt="Selfie with ID"
                        width={140}
                        height={140}
                        className="rounded-full border cursor-pointer hover:opacity-80"
                        onClick={() => setPreviewImage({ url: application.idSelfieUrl, label: 'Selfie with ID' })}
                      />
                    </div>
                  )}
                  {!(application.governmentIdFrontUrl || application.governmentIdBackUrl || application.idSelfieUrl) && (
                    <div className="text-muted-foreground">No ID or selfie images uploaded.</div>
                  )}
                </div>
                {/* Floating image modal */}
                {previewImage && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
                    onClick={() => setPreviewImage(null)}
                  >
                    <div
                      className="relative bg-white rounded-lg shadow-lg p-4 max-w-full max-h-full flex flex-col items-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="absolute top-2 right-2 text-gray-600 hover:text-black"
                        onClick={() => setPreviewImage(null)}
                        aria-label="Close preview"
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <div className="mb-2 font-semibold text-lg">{previewImage.label}</div>
                      <div className="relative w-[90vw] max-w-2xl h-[60vh] max-h-[80vw]">
                        <Image
                          src={previewImage.url}
                          alt={previewImage.label}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Add more cards for registration, transfer, etc. as needed */}
        </CardContent>
        {/* Approval outcome, remarks, and actions can be added here as needed */}
      </Card>
    </div>
  );
}