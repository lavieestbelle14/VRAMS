import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Clock, XCircle, FileText, CalendarDays, User, AlertCircle, Download, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Application } from "@/types";
import { useRouter } from "next/navigation";  // Add this import at the top

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending Review' };
    case 'reviewing':
      return { icon: FileText, color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Under Review' };
    case 'approved':
      return { icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' };
    case 'rejected':
      return { icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected' };
    default:
      return { icon: AlertCircle, color: 'bg-gray-100 text-gray-800 border-gray-200', text: status };
  }
};

export function ApplicationDetailsModal({ application, isOpen, onClose }: ApplicationDetailsModalProps) {
  if (!application) return null;
  
  const router = useRouter();  // Add this hook
  const handleReapply = () => {
    onClose();  // Close the modal first
    router.push("/public/apply");  // Redirect to apply page
  };

  const { icon: StatusIcon, color, text } = getStatusInfo(application.status);
  
  // Mock timeline data - in a real app, this would come from the application object
  const timeline = [
    { 
      date: application.submissionDate, 
      status: 'Submitted', 
      description: 'Application submitted successfully',
      completed: true
    },
    { 
      date: new Date(new Date(application.submissionDate).getTime() + 24 * 60 * 60 * 1000).toISOString(), 
      status: 'Document Verification', 
      description: 'Documents verified by COMELEC staff',
      completed: application.status !== 'pending'
    },
    { 
      date: new Date(new Date(application.submissionDate).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), 
      status: 'Background Check', 
      description: 'Applicant information validated',
      completed: ['approved', 'rejected'].includes(application.status)
    },
    { 
      date: new Date(new Date(application.submissionDate).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(), 
      status: 'Final Decision', 
      description: application.status === 'approved' ? 'Application approved' : 
                   application.status === 'rejected' ? 'Application rejected' : 'Pending decision',
      completed: ['approved', 'rejected'].includes(application.status)
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Application Details</DialogTitle>
            <Badge className={`flex items-center gap-1 ${color}`}>
              <StatusIcon className="h-4 w-4" />
              <span>{text}</span>
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="status" className="mt-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status">Status & Timeline</TabsTrigger>
            <TabsTrigger value="details">Application Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          {/* Status & Timeline Tab */}
          <TabsContent value="status" className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold flex items-center gap-2 mb-2">
                <CalendarDays className="h-4 w-4 text-blue-700" />
                Application Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Reference ID:</span>
                  <p className="font-medium">{application.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Application Type:</span>
                  <p className="font-medium">{application.applicationType.charAt(0).toUpperCase() + application.applicationType.slice(1)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Submitted On:</span>
                  <p className="font-medium">{format(new Date(application.submissionDate), "MMMM d, yyyy 'at' h:mm a")}</p>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  <p className="font-medium">{text}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h3 className="font-semibold mb-4">Application Progress Timeline</h3>
              <div className="relative">
                {/* Timeline connecting line */}
                <div className="absolute left-[15px] top-1 h-full w-[2px] bg-gray-200"></div>
                
                {/* Timeline events */}
                <div className="space-y-6">
                  {timeline.map((event, index) => (
                    <div key={index} className="flex gap-4 relative">
                      <div className={`h-8 w-8 rounded-full ${event.completed ? 'bg-green-500' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0`}>
                        {event.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="pt-1">
                        <h4 className="font-medium">{event.status}</h4>
                        <p className="text-sm text-gray-500">{event.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {event.completed 
                            ? format(new Date(event.date), "MMMM d, yyyy")
                            : `Expected: ${format(new Date(event.date), "MMMM d, yyyy")}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold mb-2">Next Steps</h3>
              {application.status === 'approved' ? (
                <p className="text-sm">
                  Your application has been approved! Your voter record is now active. You will receive your voter ID via mail within 2-3 weeks.
                </p>
              ) : application.status === 'rejected' ? (
                <p className="text-sm">
                  Your application has been rejected. Please review the remarks section for reasons and resubmit a new application addressing the issues.
                </p>
              ) : (
                <p className="text-sm">
                  Your application is currently being processed. Please check back for updates or wait for email notifications regarding your application status.
                </p>
              )}
            </div>

            {/* Remarks section if application has remarks */}
            {application.remarks && (
              <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                <h3 className="font-semibold mb-2">Remarks from COMELEC</h3>
                <p className="text-sm">{application.remarks}</p>
              </div>
            )}
          </TabsContent>
          
          {/* Application Details Tab */}
          <TabsContent value="details">
            <div className="space-y-8">

              {/* Personal Information */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Full Name:</span>
                    <p className="font-medium">
                      {[
                        application.personalInfo.firstName,
                        application.personalInfo.middleName,
                        application.personalInfo.lastName,
                        application.personalInfo.suffix
                      ].filter(Boolean).join(" ") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date of Birth:</span>
                    <p className="font-medium">
                      {application.personalInfo.dob || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Sex:</span>
                    <p className="font-medium">{application.personalInfo.sex || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Civil Status:</span>
                    <p className="font-medium">
                      {application.personalInfo.civilStatus || application.civilDetails?.civilStatus || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Citizenship Type:</span>
                    <p className="font-medium">{application.personalInfo.citizenshipType || "—"}</p>
                  </div>
                  {application.personalInfo.naturalizationDate && (
                    <div>
                      <span className="text-gray-500">Naturalization Date:</span>
                      <p className="font-medium">{application.personalInfo.naturalizationDate}</p>
                    </div>
                  )}
                  {application.personalInfo.naturalizationCertNo && (
                    <div>
                      <span className="text-gray-500">Naturalization Cert. No.:</span>
                      <p className="font-medium">{application.personalInfo.naturalizationCertNo}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{application.personalInfo.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Mobile Number:</span>
                    <p className="font-medium">{application.personalInfo.mobileNumber || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Current Address:</span>
                  <p className="font-medium">{application.addressDetails.houseNoStreet || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Barangay:</span>
                  <p className="font-medium">{application.addressDetails.barangay || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">City/Municipality:</span>
                  <p className="font-medium">{application.addressDetails.cityMunicipality || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Province:</span>
                  <p className="font-medium">{application.addressDetails.province || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Length of Residency:</span>
                  <p className="font-medium">
                    {application.addressDetails.yearsOfResidency
                      ? `${application.addressDetails.yearsOfResidency} years`
                      : "—"}
                    {application.addressDetails.monthsOfResidency
                      ? `, ${application.addressDetails.monthsOfResidency} months`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Family Information */}
              <div>
                <h3 className="font-semibold mb-3">Family Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Father's Name:</span>
                    <p className="font-medium">
                      {(application.personalInfo.fatherFirstName || application.civilDetails?.fatherFirstName || "—") + " " +
                      (application.personalInfo.fatherLastName || application.civilDetails?.fatherLastName || "")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Mother's Name:</span>
                    <p className="font-medium">
                      {(application.personalInfo.motherFirstName || application.civilDetails?.motherFirstName || "—") + " " +
                      (application.personalInfo.motherLastName || application.civilDetails?.motherLastName || "")}
                    </p>
                  </div>
                  {(application.personalInfo.spouseName || application.civilDetails?.spouseName) && (
                    <div>
                      <span className="text-gray-500">Spouse Name:</span>
                      <p className="font-medium">
                        {application.personalInfo.spouseName || application.civilDetails?.spouseName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Other Information */}
              <div>
                <h3 className="font-semibold mb-3">Other Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Profession/Occupation:</span>
                    <p className="font-medium">{application.personalInfo.professionOccupation}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">PWD:</span>
                    <p className="font-medium">{application.personalInfo.isPwd ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Senior Citizen:</span>
                    <p className="font-medium">{application.personalInfo.isSenior ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Indigenous Person:</span>
                    <p className="font-medium">{application.personalInfo.isIndigenousPerson ? "Yes" : "No"}</p>
                  </div>
                  {application.personalInfo.indigenousTribe && (
                    <div>
                      <span className="text-gray-500">Indigenous Tribe:</span>
                      <p className="font-medium">{application.personalInfo.indigenousTribe}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500">Illiterate:</span>
                    <p className="font-medium">{application.personalInfo.isIlliterate ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              {/* Application Type & Status */}
              <div>
                <h3 className="font-semibold mb-3">Application Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Application Type:</span>
                    <p className="font-medium">{application.applicationType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <p className="font-medium">{application.status}</p>
                  </div>
                </div>
              </div>

            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="space-y-6">
              <h3 className="font-semibold mb-3">Submitted Documents</h3>
              
              {Array.isArray(application.documents) && application.documents.length > 0 ? (
                <div className="space-y-3">
                  {application.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-500">Uploaded on {format(new Date(doc.uploadDate || application.submissionDate), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No documents available</p>
              )}

              {/* Required Documents Section */}
              {application.status !== 'approved' && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3">Required Documents</h3>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Valid Government-issued ID</li>
                      <li>Proof of Residence (Utility bill, etc.)</li>
                      <li>Birth Certificate</li>
                      <li>Recent 2x2 ID Picture</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        {application.status === 'rejected' && (
          <Button onClick={handleReapply}>Reapply</Button>
        )}
      </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}