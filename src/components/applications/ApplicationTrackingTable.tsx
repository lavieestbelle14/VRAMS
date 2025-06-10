"use client";

import { useState } from "react";
import { ApplicationDetailsModal } from "./ApplicationDetailsModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, Info } from "lucide-react";
import { format } from "date-fns";
import type { Application } from "@/types";

interface ApplicationTrackingTableProps {
  applications: Application[];
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'pending':
      return { icon: Clock, color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review' };
    case 'reviewing':
      return { icon: Info, color: 'bg-blue-100 text-blue-800', text: 'Under Review' };
    case 'approved':
      return { icon: CheckCircle2, color: 'bg-green-100 text-green-800', text: 'Approved' };
    case 'rejected':
      return { icon: XCircle, color: 'bg-red-100 text-red-800', text: 'Rejected' };
    default:
      return { icon: Info, color: 'bg-gray-100 text-gray-800', text: status };
  }
};

export function ApplicationTrackingTable({ applications }: ApplicationTrackingTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Application ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submission Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => {
            const { icon: StatusIcon, color, text } = getStatusInfo(application.status);
            
            return (
              <TableRow key={application.id}>
                <TableCell className="font-medium">{application.id}</TableCell>
                <TableCell>
                  {application.applicationType.charAt(0).toUpperCase() + 
                   application.applicationType.slice(1)}
                </TableCell>
                <TableCell>
                  <Badge className={`flex w-fit items-center gap-1 ${color}`}>
                    <StatusIcon className="h-3 w-3" />
                    <span>{text}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(application.submissionDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {application.personalInfo.firstName} {application.personalInfo.lastName}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    onClick={() => handleViewDetails(application)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <ApplicationDetailsModal 
        application={selectedApplication}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}