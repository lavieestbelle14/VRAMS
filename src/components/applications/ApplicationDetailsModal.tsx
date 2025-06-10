"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import type { Application } from "@/types";

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

type StatusInfo = {
  text: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getStatusInfo(status: string): StatusInfo {
  // Example mapping, adjust as needed
  switch (status) {
    case "approved":
      return {
        text: "Approved",
        color: "bg-green-500",
        icon: () => <span className="h-4 w-4 mr-2">✔️</span>,
      };
    case "pending":
      return {
        text: "Pending",
        color: "bg-yellow-500",
        icon: () => <span className="h-4 w-4 mr-2">⏳</span>,
      };
    case "rejected":
      return {
        text: "Rejected",
        color: "bg-red-500",
        icon: () => <span className="h-4 w-4 mr-2">❌</span>,
      };
    default:
      return {
        text: status,
        color: "bg-gray-500",
        icon: () => <span className="h-4 w-4 mr-2">❔</span>,
      };
  }
}

export function ApplicationDetailsModal({ application, isOpen, onClose }: ApplicationDetailsModalProps) {
  if (!application) return null;

  const statusInfo = getStatusInfo(application.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <Badge className={`text-base ${statusInfo.color}`}>
                <statusInfo.icon className="h-4 w-4 mr-2" />
                {statusInfo.text}
              </Badge>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p>{application.personalInfo.firstName} {application.personalInfo.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p>{format(new Date(application.submissionDate), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Type</p>
                  <p>{application.applicationType.charAt(0).toUpperCase() + 
                      application.applicationType.slice(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p>{application.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Street Address</p>
                  <p>{application.addressDetails.houseNoStreet}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Barangay</p>
                  <p>{application.addressDetails.barangay}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">City/Municipality</p>
                  <p>{application.addressDetails.cityMunicipality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Province</p>
                  <p>{application.addressDetails.province}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}