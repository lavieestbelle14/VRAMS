
'use client';

import type { Application } from '@/types';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VoterIdDisplayProps {
  application: Application;
}

export function VoterIdDisplay({ application }: VoterIdDisplayProps) {
  if (!application.voterId || !application.precinct) {
    return <p>Voter ID details are not yet available.</p>;
  }

  const { personalInfo: pi, addressDetails: ad, civilDetails: cd } = application;

  const formattedDob = pi.dob ? format(parseISO(pi.dob), 'MMMM dd, yyyy') : 'N/A';
  
  const getCitizenshipDisplay = () => {
    if (pi.citizenshipType === 'byBirth' || pi.citizenshipType === 'reacquired' || pi.citizenshipType === 'naturalized') {
      return 'Filipino';
    }
    return 'N/A';
  };

  const summarizedAddress = `${ad.houseNoStreet}, ${ad.barangay}, ${ad.cityMunicipality}`;

  return (
    <Card className="w-full max-w-2xl mx-auto my-6 shadow-lg border-2 border-gray-300 font-sans">
      <CardContent className="p-4">
        <div className="text-center mb-3">
          <p className="text-[8px] uppercase tracking-wider">Republic of the Philippines</p>
          <p className="text-xs font-bold uppercase tracking-wide">Commission on Elections</p>
          <p className="text-[7px] uppercase tracking-wider">ISSUING DISTRICT OFFICE (Placeholder)</p>
        </div>

        <div className="flex flex-row gap-3 items-start">
          {/* Left Column: Logo & Photo */}
          <div className="flex flex-col items-center space-y-2 w-1/4">
            <Image
              src="/vrams_logo.png" 
              alt="COMELEC Seal"
              width={50}
              height={50}
              data-ai-hint="COMELEC seal"
              className="mb-1"
            />
            <div className="w-[70px] h-[90px] bg-gray-200 border border-gray-400 flex items-center justify-center">
              <Image
                src="https://placehold.co/70x90.png"
                alt="Voter Photo"
                width={70}
                height={90}
                data-ai-hint="person portrait"
              />
            </div>
             <div className="w-[70px] mt-1 border-t-2 border-black pt-1 text-center">
              <p className="text-[6px] uppercase">Signature of Voter</p>
            </div>
          </div>

          {/* Right Column: Details & QR */}
          <div className="flex-1 flex flex-row">
            {/* Main Details */}
            <div className="w-2/3 pr-2">
              <div className="mb-2">
                <p className="text-[9px] font-semibold">VIN: <span className="font-bold text-xs">{application.voterId}</span></p>
              </div>
              
              <div className="mb-1">
                <p className="text-xs font-bold uppercase">{pi.lastName || 'N/A'}</p>
                <p className="text-xs font-bold uppercase">{pi.firstName || 'N/A'}</p>
                {pi.middleName && <p className="text-xs font-bold uppercase">{pi.middleName}</p>}
              </div>

              <div className="grid grid-cols-[auto,1fr] gap-x-1 text-[8px] leading-tight">
                <span className="font-medium">Date of Birth</span><span>: {formattedDob}</span>
                <span className="font-medium">Civil Status</span><span className="capitalize">: {cd.civilStatus || 'N/A'}</span>
                <span className="font-medium">Citizenship</span><span>: {getCitizenshipDisplay()}</span>
                <span className="font-medium">Address</span><span className="truncate" title={summarizedAddress}>: {summarizedAddress}</span>
                <span className="font-medium">Precinct No.</span><span>: {application.precinct}</span>
              </div>

              <div className="mt-6 text-center">
                <p className="text-[7px] uppercase font-semibold">JUAN DELA CRUZ (Placeholder)</p>
                <p className="text-[6px] uppercase">Chairman</p>
              </div>
            </div>
            
            {/* QR Code Area */}
            <div className="w-1/3 flex flex-col items-center justify-start pl-2 border-l border-gray-300">
               <Image
                src="https://placehold.co/80x80.png"
                alt="QR Code"
                width={80}
                height={80}
                data-ai-hint="QR code"
                className="mt-8"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
