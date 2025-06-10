"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChevronRight, UserCheck, RefreshCw, FileText, Edit3, Plus } from "lucide-react";

const applicationTypes = [
  {
    id: "registration",
    title: "Application for Registration",
    description: "For first-time voter registration",
    icon: <UserCheck className="w-6 h-6" />,
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200"
  },
  {
    id: "transfer",
    title: "Transfer of Registration Record",
    description: "Within or from another City/Municipality/District",
    icon: <RefreshCw className="w-6 h-6" />,
    color: "bg-green-50 hover:bg-green-100 border-green-200"
  },
  {
    id: "reactivation",
    title: "Reactivation of Registration Record",
    description: "For previously deactivated voter records",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200"
  },
  {
    id: "correction",
    title: "Change/Correction of Entries",
    description: "Update or correct information in your voter record",
    icon: <Edit3 className="w-6 h-6" />,
    color: "bg-purple-50 hover:bg-purple-100 border-purple-200"
  },
  {
    id: "inclusion",
    title: "Inclusion/Reinstatement",
    description: "For inclusion of records or reinstatement of name",
    icon: <Plus className="w-6 h-6" />,
    color: "bg-teal-50 hover:bg-teal-100 border-teal-200"
  }
];

export function ApplicationTypeSelector() {
  const router = useRouter();

  const handleTypeSelect = (typeId: string) => {
    router.push(`/register/form?type=${typeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Application Type</h1>
            <p className="text-gray-600">Choose your voter registration application type</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {applicationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleTypeSelect(type.id)}
                className={`${type.color} border-2 rounded-lg p-6 text-left transition-all 
                  duration-200 hover:shadow-md focus:outline-none focus:ring-2 
                  focus:ring-blue-500`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-gray-700">
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base text-gray-900 mb-2">
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {type.description}
                    </p>
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      Select this type
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}