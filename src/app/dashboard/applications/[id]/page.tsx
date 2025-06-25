'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getApplicationByPublicId, updateApplicationRemarks, updateApplicationStatus, approveApplicationWithVoterRecord, getOfficerAssignments, updateErbHearingDate } from '@/services/applicationService';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
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
import { Application } from '@/types';

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
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [disapprovalReason, setDisapprovalReason] = useState('');
  const [showDisapprovalDialog, setShowDisapprovalDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [voterInfo, setVoterInfo] = useState({ precinctNumber: '', voterId: '' });
  const [officerAssignments, setOfficerAssignments] = useState<any[]>([]);
  const [isEditingErbDate, setIsEditingErbDate] = useState(false);
  const [erbHearingDate, setErbHearingDate] = useState('');
  const [erbDateUpdateLoading, setErbDateUpdateLoading] = useState(false);

  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      
      Promise.all([
        getApplicationByPublicId(id),
        getOfficerAssignments(id)
      ])        .then(([appData, assignments]) => {
          console.log('[DEBUG] Application data received:', appData);
          console.log('[DEBUG] Application address fields:', {
            houseNumber: appData?.houseNumber,
            street: appData?.street,
            barangay: appData?.barangay,
            cityMunicipality: appData?.cityMunicipality,
            province: appData?.province
          });
          console.log('[DEBUG] Special sector data received:', {
            isIlliterate: appData?.isIlliterate,
            isSeniorCitizen: appData?.isSeniorCitizen,
            voteOnGroundFloor: appData?.voteOnGroundFloor,
            tribe: appData?.tribe,
            typeOfDisability: appData?.typeOfDisability,
            assistanceNeeded: appData?.assistanceNeeded,
            assistorName: appData?.assistorName
          });
          
          if (appData) {
            setApplication(appData);
            setRemarks(appData.remarks || '');
            setErbHearingDate(appData.erbHearingDate || '');
          } else {
            setApplication(null);
          }
          setOfficerAssignments(assignments || []);
        })
        .catch(e => {
          setError('Failed to fetch application details.');
          setApplication(null);
          setOfficerAssignments([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus: Application['status'], reasonForDisapproval?: string) => {
    if (!application) return;
    
    // For approval, show the voter information dialog instead
    if (newStatus === 'approved') {
      setShowApprovalDialog(true);
      return;
    }
    
    setStatusUpdateLoading(true);
    try {
      const success = await updateApplicationStatus(application.id, newStatus, reasonForDisapproval);
      if (success) {
        // Update local application state
        setApplication((prev: any) => ({ 
          ...prev, 
          status: newStatus,
          reasonForDisapproval: newStatus === 'disapproved' ? reasonForDisapproval : null
        }));
        
        toast({
          title: `Application ${newStatus}`,
          description: `Application ${application.id} has been ${newStatus}.`,
        });
        
        if (newStatus === 'disapproved') {
          setShowDisapprovalDialog(false);
          setDisapprovalReason('');
        }
        
        // Refresh officer assignments after status update
        const assignments = await getOfficerAssignments(id);
        setOfficerAssignments(assignments || []);
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to update status.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update status.', 
        variant: 'destructive' 
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleApprovalWithVoterRecord = async () => {
    if (!application || !voterInfo.precinctNumber.trim() || !voterInfo.voterId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both precinct number and voter ID.',
        variant: 'destructive'
      });
      return;
    }

    setStatusUpdateLoading(true);
    try {
      const success = await approveApplicationWithVoterRecord(application.id, voterInfo);
      if (success) {
        // Update local application state
        setApplication((prev: any) => ({ 
          ...prev, 
          status: 'approved',
          reasonForDisapproval: null
        }));
        
        toast({
          title: 'Application Approved',
          description: `Application ${application.id} has been approved and voter record created.`,
        });
        
        setShowApprovalDialog(false);
        setVoterInfo({ precinctNumber: '', voterId: '' });
        
        // Refresh officer assignments after approval
        const assignments = await getOfficerAssignments(id);
        setOfficerAssignments(assignments || []);
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to approve application and create voter record.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error approving application:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to approve application.', 
        variant: 'destructive' 
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleDeleteApplication = () => {
    // Delete functionality can be implemented if needed
    setShowDeleteDialog(false);
  };

  const handleErbHearingDateUpdate = async () => {
    if (!application) return;
    
    setErbDateUpdateLoading(true);
    try {
      const dateToUpdate = erbHearingDate ? erbHearingDate : null;
      const success = await updateErbHearingDate(application.id, dateToUpdate);
      
      if (success) {
        setApplication((prev: any) => ({ 
          ...prev, 
          erbHearingDate: dateToUpdate
        }));
        
        toast({
          title: 'ERB Hearing Date Updated',
          description: dateToUpdate 
            ? `ERB hearing date set to ${format(new Date(dateToUpdate), 'PPP')}`
            : 'ERB hearing date cleared',
        });
        
        setIsEditingErbDate(false);
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to update ERB hearing date.', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error updating ERB hearing date:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update ERB hearing date.', 
        variant: 'destructive' 
      });
    } finally {
      setErbDateUpdateLoading(false);
    }
  };

  const handleCancelErbDateEdit = () => {
    setErbHearingDate(application?.erbHearingDate || '');
    setIsEditingErbDate(false);
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
  console.log('Debug - Application object:', application);
  console.log('Debug - Address fields:', {
    houseNumber: application.houseNumber,
    street: application.street,
    barangay: application.barangay,
    cityMunicipality: application.cityMunicipality,
    province: application.province,
    yearsOfResidenceAddress: application.yearsOfResidenceAddress,
    monthsOfResidenceAddress: application.monthsOfResidenceAddress
  });
  
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
  };  const ad = {
    houseNoStreet: `${application.houseNumber || ''} ${application.street || ''}`.trim() || 'Not provided',
    barangay: application.barangay || 'Not provided',
    cityMunicipality: application.cityMunicipality || 'Not provided',
    province: application.province || 'Not provided',
    zipCode: '',
    yearsOfResidency: application.yearsOfResidenceAddress || 0,
    monthsOfResidency: application.monthsOfResidenceAddress || 0,
  };
    // Check if this application type requires address information
  const addressRequiredTypes = ['register', 'transfer', 'transfer_with_reactivation'];
  const isAddressRequired = addressRequiredTypes.includes(application.applicationType);
  const hasAddressData = application.barangay && application.cityMunicipality && application.province;
  
  // Debug logging for address data
  console.log('[DEBUG] Address data check:', {
    applicationType: application.applicationType,
    isAddressRequired,
    hasAddressData,
    addressFields: {
      houseNumber: application.houseNumber,
      street: application.street,
      barangay: application.barangay,
      cityMunicipality: application.cityMunicipality,
      province: application.province,
      yearsOfResidenceAddress: application.yearsOfResidenceAddress,
      monthsOfResidenceAddress: application.monthsOfResidenceAddress
    }
  });
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
      case 'disapproved': return 'destructive';
      case 'verified': return 'outline';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

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
        
        {/* Status Management Section */}
        <div className="px-6 pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status Management</h3>
              <p className="text-sm text-muted-foreground">
                Update the application status based on your review
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {application.status === 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('verified')}
                  disabled={statusUpdateLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {statusUpdateLoading ? (
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  )}
                  Mark as Verified
                </Button>
              )}
              
              {(application.status === 'pending' || application.status === 'verified') && (
                <>
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={statusUpdateLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {statusUpdateLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Approve
                  </Button>
                  
                  <Button
                    onClick={() => setShowDisapprovalDialog(true)}
                    disabled={statusUpdateLoading}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Disapprove
                  </Button>
                </>
              )}
              
              {application.status !== 'pending' && (
                <Button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={statusUpdateLoading}
                  variant="outline"
                >
                  {statusUpdateLoading ? (
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Clock className="mr-2 h-4 w-4" />
                  )}
                  Revert to Pending
                </Button>
              )}
            </div>
          </div>
          
          {application.reasonForDisapproval && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Label className="text-sm font-semibold text-red-800">Reason for Disapproval:</Label>
              <p className="text-sm text-red-700 mt-1">{application.reasonForDisapproval}</p>
            </div>
          )}
        </div>

        {/* Disapproval Dialog */}
        <AlertDialog open={showDisapprovalDialog} onOpenChange={setShowDisapprovalDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disapprove Application</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide a reason for disapproving this application. This will be shown to the applicant.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4">
              <Label htmlFor="disapproval-reason">Reason for disapproval</Label>
              <Textarea
                id="disapproval-reason"
                value={disapprovalReason}
                onChange={(e) => setDisapprovalReason(e.target.value)}
                placeholder="Enter the reason for disapproval..."
                rows={4}
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDisapprovalReason('');
                setShowDisapprovalDialog(false);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusUpdate('disapproved', disapprovalReason)}
                disabled={!disapprovalReason.trim() || statusUpdateLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {statusUpdateLoading ? 'Processing...' : 'Disapprove Application'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Approval Dialog with Voter Information */}
        <AlertDialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Application</AlertDialogTitle>
              <AlertDialogDescription>
                Please provide voter registration details to complete the approval process.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 my-4">
              <div>
                <Label htmlFor="precinct-number">Precinct Number</Label>
                <Input
                  id="precinct-number"
                  value={voterInfo.precinctNumber}
                  onChange={(e) => setVoterInfo(prev => ({ ...prev, precinctNumber: e.target.value }))}
                  placeholder="e.g., 001-A"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="voter-id">Voter ID</Label>
                <Input
                  id="voter-id"
                  value={voterInfo.voterId}
                  onChange={(e) => setVoterInfo(prev => ({ ...prev, voterId: e.target.value }))}
                  placeholder="e.g., 20250001234"
                  className="mt-2"
                />
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">Information Required:</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Precinct Number: The assigned precinct for this voter</li>
                  <li>• Voter ID: Unique identifier for the voter record</li>
                </ul>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setVoterInfo({ precinctNumber: '', voterId: '' });
                setShowApprovalDialog(false);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleApprovalWithVoterRecord}
                disabled={!voterInfo.precinctNumber.trim() || !voterInfo.voterId.trim() || statusUpdateLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {statusUpdateLoading ? 'Processing...' : 'Approve Application'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
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
          </Card>          <Card>
            <CardHeader><CardTitle className="flex items-center"><MapPin className="mr-2"/>Declared Address</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Always show address fields, with fallbacks */}
                <DetailItem label="House No./Street" value={ad.houseNoStreet !== 'Not provided' ? ad.houseNoStreet : 'Not provided'} />
                <DetailItem label="Barangay" value={ad.barangay !== 'Not provided' ? ad.barangay : 'Not provided'} />
                <DetailItem label="City/Municipality" value={ad.cityMunicipality !== 'Not provided' ? ad.cityMunicipality : 'Not provided'} />
                <DetailItem label="Province" value={ad.province !== 'Not provided' ? ad.province : 'Not provided'} />
                
                {/* Show full address only if we have meaningful data */}
                {hasAddressData && (
                  <DetailItem label="Full Address" value={`${ad.houseNoStreet}, ${ad.barangay}, ${ad.cityMunicipality}, ${ad.province}`} />
                )}
                
                <DetailItem label="Years at Current Address" value={ad.yearsOfResidency?.toString() || '0'} />
                <DetailItem label="Months at Current Address" value={ad.monthsOfResidency?.toString() || '0'} />
                
                {/* Address requirement note */}
                <div className="text-xs text-muted-foreground mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">
                    {isAddressRequired 
                      ? `✓ Address is required for ${applicationTypeLabels[application.applicationType as keyof typeof applicationTypeLabels]} applications`
                      : `ⓘ Address is not required for ${applicationTypeLabels[application.applicationType as keyof typeof applicationTypeLabels]} applications`
                    }
                  </p>
                  {!hasAddressData && isAddressRequired && (
                    <p className="text-red-600 mt-1">⚠ Address information appears to be incomplete or missing</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Building className="mr-2"/>Period of Residence</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Years in City/Municipality" value={pi.residencyYearsCityMun} />
              <DetailItem label="Months in City/Municipality" value={pi.residencyMonthsCityMun} />
              <DetailItem label="Years in Philippines" value={pi.residencyYearsPhilippines} />
            </CardContent>
          </Card>          <Card>
            <CardHeader><CardTitle className="flex items-center"><Users className="mr-2"/>Civil & Family Details</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Civil Status" value={cd.civilStatus} />
              {cd.civilStatus === 'Married' && <DetailItem label="Spouse's Name" value={cd.spouseName} />}
              <DetailItem label="Father's Full Name" value={`${cd.fatherFirstName} ${cd.fatherLastName}`} />
              <DetailItem label="Mother's Full Name" value={`${cd.motherFirstName} ${cd.motherLastName}`} />
            </CardContent>
          </Card>
            {/* Special Sector Information */}
          <Card>
            <CardHeader><CardTitle className="flex items-center"><Accessibility className="mr-2"/>Special Sector Information</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Basic special sector flags */}
                <DetailItem 
                  label="Illiterate" 
                  value={application.isIlliterate === true ? 'Yes' : application.isIlliterate === false ? 'No' : 'Not specified'} 
                />
                <DetailItem 
                  label="Senior Citizen" 
                  value={application.isSeniorCitizen === true ? 'Yes' : application.isSeniorCitizen === false ? 'No' : 'Not specified'} 
                />
                <DetailItem 
                  label="Prefers Ground Floor Voting" 
                  value={application.voteOnGroundFloor === true ? 'Yes' : application.voteOnGroundFloor === false ? 'No' : 'Not specified'} 
                />
                
                {/* Indigenous Person Information */}
                <DetailItem 
                  label="Indigenous Person" 
                  value={application.tribe ? 'Yes' : 'No'} 
                />
                {application.tribe && (
                  <DetailItem label="Tribe" value={application.tribe} />
                )}
                
                {/* Person with Disability Information */}
                <DetailItem 
                  label="Person with Disability (PWD)" 
                  value={application.typeOfDisability ? 'Yes' : 'No'} 
                />
                {application.typeOfDisability && (
                  <DetailItem label="Type of Disability" value={application.typeOfDisability} />
                )}
                
                {/* Assistance Information */}
                {application.assistanceNeeded && (
                  <DetailItem label="Assistance Needed" value={application.assistanceNeeded} />
                )}
                {application.assistorName && (
                  <DetailItem label="Assistor Name" value={application.assistorName} />
                )}
                
                {/* Show message if no special sector information */}
                {!application.isIlliterate && !application.isSeniorCitizen && !application.voteOnGroundFloor && 
                 !application.tribe && !application.typeOfDisability && !application.assistanceNeeded && !application.assistorName && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No special sector information provided</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Special sector information includes: illiteracy status, senior citizen status, ground floor voting preference, indigenous status, disability status, and assistance requirements
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card><Card className="lg:col-span-1">
            <CardHeader><CardTitle className="flex items-center"><FileText className="mr-2"/>Application Type</CardTitle></CardHeader>
            <CardContent>
              <DetailItem label="Application Type" value={applicationTypeLabels[application.applicationType as keyof typeof applicationTypeLabels] || 'Unknown Type'} />
            </CardContent>
          </Card>
          
          {/* Transfer Application Details */}
          {(application.applicationType === 'transfer' || application.applicationType === 'transfer_with_reactivation') && application.previousPrecinctNumber && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><MapPin className="mr-2"/>Transfer Details</CardTitle></CardHeader>
              <CardContent>
                <DetailItem label="Transfer Type" value={application.transferType || 'N/A'} />
                <DetailItem label="Previous Precinct Number" value={application.previousPrecinctNumber || 'N/A'} />
                <DetailItem label="Previous Address" value={
                  [
                    application.previousBarangay,
                    application.previousCityMunicipality,
                    application.previousProvince
                  ].filter(Boolean).join(', ') || 'N/A'
                } />
                {application.previousCountry && (
                  <DetailItem label="Previous Country" value={application.previousCountry} />
                )}
                {application.previousForeignPost && (
                  <DetailItem label="Previous Foreign Post" value={application.previousForeignPost} />
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Reactivation Application Details */}
          {(application.applicationType === 'reactivation' || application.applicationType === 'transfer_with_reactivation') && application.reasonForDeactivation && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><ShieldCheck className="mr-2"/>Reactivation Details</CardTitle></CardHeader>
              <CardContent>
                <DetailItem label="Reason for Deactivation" value={application.reasonForDeactivation || 'N/A'} />
              </CardContent>
            </Card>
          )}
          
          {/* Correction Application Details */}
          {application.applicationType === 'correction_of_entry' && application.targetField && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><Edit className="mr-2"/>Correction Details</CardTitle></CardHeader>
              <CardContent>
                <DetailItem label="Field to Correct" value={application.targetField || 'N/A'} />
                <DetailItem label="Current Value" value={application.currentValue || 'N/A'} />
                <DetailItem label="Requested Value" value={application.requestedValue || 'N/A'} />
              </CardContent>
            </Card>
          )}
          
          {/* Reinstatement Application Details */}
          {application.applicationType === 'reinstatement' && application.reinstatementType && (
            <Card className="lg:col-span-3">
              <CardHeader><CardTitle className="flex items-center"><ShieldCheck className="mr-2"/>Reinstatement Details</CardTitle></CardHeader>
              <CardContent>
                <DetailItem label="Reinstatement Type" value={application.reinstatementType || 'N/A'} />
              </CardContent>
            </Card>
          )}
          
          {/* Registration Application Details - ID & Selfie Preview */}
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
          
          {/* ERB Hearing Date Section */}
          <div className="px-6 pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">ERB Hearing Date</h3>
              <p className="text-sm text-muted-foreground">
                Assign or update the Election Registration Board hearing date
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {!isEditingErbDate ? (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {application.erbHearingDate 
                        ? format(new Date(application.erbHearingDate), 'PPP')
                        : 'No hearing date set'
                      }
                    </span>
                  </div>
                  <Button
                    onClick={() => setIsEditingErbDate(true)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {application.erbHearingDate ? 'Edit Date' : 'Set Date'}
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={erbHearingDate}
                    onChange={(e) => setErbHearingDate(e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    onClick={handleErbHearingDateUpdate}
                    disabled={erbDateUpdateLoading}
                    size="sm"
                  >
                    {erbDateUpdateLoading ? (
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelErbDateEdit}
                    variant="outline"
                    size="sm"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  {application.erbHearingDate && (
                    <Button
                      onClick={() => {
                        setErbHearingDate('');
                        handleErbHearingDateUpdate();
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
          
          {/* Officer Remarks & Outcome Section */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Officer Remarks & Outcome
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Officer Remarks</Label>
                  <Textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={4}
                    placeholder="No remarks yet..."
                    className="resize-none mt-2"
                    readOnly={!isEditingRemarks}
                    disabled={!isEditingRemarks}
                  />
                  <div className="flex gap-2 mt-3">
                    {!isEditingRemarks ? (
                      <Button 
                        onClick={() => setIsEditingRemarks(true)}
                        variant="outline"
                        className="w-auto"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button 
                          onClick={async () => {
                            try {
                              const success = await updateApplicationRemarks(id, remarks);
                              if (success) {
                                // Update local application state
                                setApplication((prev: any) => ({ ...prev, remarks }));
                                setIsEditingRemarks(false);
                                toast({
                                  title: "Remarks Updated",
                                  description: "Officer remarks have been saved successfully.",
                                });
                              } else {
                                toast({
                                  title: "Error",
                                  description: "Failed to update remarks. Please try again.",
                                  variant: "destructive",
                                });
                              }
                            } catch (error) {
                              console.error('Error saving remarks:', error);
                              toast({
                                title: "Error",
                                description: "Failed to update remarks. Please try again.",
                                variant: "destructive",
                              });
                            }
                          }}
                          className="w-auto"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button 
                          onClick={() => {
                            setRemarks(application.remarks || '');
                            setIsEditingRemarks(false);
                          }}
                          variant="outline"
                          className="w-auto"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Officer Assignment History */}
          {officerAssignments.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Officer Assignment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {officerAssignments.map((assignment, index) => {
                    // Get action display info
                    const getActionInfo = (action: string) => {
                      switch (action) {
                        case 'set_pending':
                          return { label: 'Set to Pending', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
                        case 'verify':
                          return { label: 'Verified', color: 'bg-blue-50 text-blue-700 border-blue-200' };
                        case 'approve':
                          return { label: 'Approved', color: 'bg-green-50 text-green-700 border-green-200' };
                        case 'disapprove':
                          return { label: 'Disapproved', color: 'bg-red-50 text-red-700 border-red-200' };
                        default:
                          return { label: action, color: 'bg-gray-50 text-gray-700 border-gray-200' };
                      }
                    };

                    const actionInfo = getActionInfo(assignment.action);

                    return (
                      <div key={assignment.assignment_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <User className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {assignment.officer?.first_name} {assignment.officer?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{assignment.officer?.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`${actionInfo.color}`}>
                            {actionInfo.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Officers listed have performed actions on this application. The most recent action taken by each officer is shown.
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for displaying detail items
function DetailItem({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900 text-right max-w-xs truncate">{value || 'N/A'}</span>
    </div>
  );
}