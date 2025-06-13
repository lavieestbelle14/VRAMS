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
import { useState } from "react";

type StatusInfo = {
  text: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
};

function getStatusInfo(status: string): StatusInfo {
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

interface ApplicationDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
}: ApplicationDetailsModalProps) {
  if (!application) return null;

  const statusInfo = getStatusInfo(application.status);
  const [zoomedImg, setZoomedImg] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Application Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Status Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Status</h3>
              <Badge className={`text-base ${statusInfo.color}`}>
                <statusInfo.icon className="h-4 w-4 mr-2" />
                {statusInfo.text}
              </Badge>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => setShowRejectModal(true)}
                >
                  Reject
                </button>
              </div>
              {application.status === "rejected" && application.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 rounded">
                  <p className="text-sm font-semibold text-red-700">
                    Reason for Rejection:
                  </p>
                  <p className="text-sm text-red-700">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p>
                    {application.personalInfo.firstName}{" "}
                    {application.personalInfo.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Submitted</p>
                  <p>
                    {format(
                      new Date(application.submissionDate),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application Type</p>
                  <p>
                    {application.applicationType.charAt(0).toUpperCase() +
                      application.applicationType.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p>{application.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* ID Document Section */}
            <div className="border rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span role="img" aria-label="ID">
                  🪪
                </span>
                ID Document
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {["Front", "Back", "Selfie"].map((label, idx) => {
                  const imgUrl =
                    idx === 0
                      ? application.idFrontUrl
                      : idx === 1
                      ? application.idBackUrl
                      : application.selfieUrl;
                  return (
                    <div key={label} className="flex flex-col items-center">
                      <span className="font-medium mb-2">{label}</span>
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={label}
                          className="w-32 h-32 object-cover rounded shadow cursor-pointer hover:scale-105 transition"
                          onClick={() => setZoomedImg(imgUrl)}
                        />
                      ) : (
                        <span className="text-gray-400">No image</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Zoom Modal */}
              {zoomedImg && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                  onClick={() => setZoomedImg(null)}
                >
                  <img
                    src={zoomedImg}
                    alt="Zoomed"
                    className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Address Information
              </h3>
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

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white border rounded-lg p-6 w-full max-w-md shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-red-700">
                Reject Application
              </h3>
              <label className="block mb-2 font-medium">
                Reason for Rejection:
              </label>
              <textarea
                className="w-full border rounded p-2 mb-4"
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason..."
              />
              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded"
                  onClick={() => {
                    // Call your reject handler here
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  disabled={!rejectionReason.trim()}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}