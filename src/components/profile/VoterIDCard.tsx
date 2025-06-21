import React from "react";
import Image from "next/image";

export default function VoterIdCard() {
  return (
    <div
      className="mx-auto rounded-xl shadow-lg p-5 relative"
      style={{
        fontFamily: "Arial, sans-serif",
        width: "500px",
        maxWidth: "500px",
        background: "linear-gradient(120deg, #E3F4FF 0%, #B5E3FF 200%)", 
      }}
    >
      <div className="flex items-center mb-4">
        <img
          src="/ph-comelec-logo.png"
          alt="COMELEC Logo"
          className="h-16 w-16 mr-4" 
        />
        <div className="flex-1 text-center">
          <div className="text-xs uppercase tracking-wide">
            Republic of the Philippines
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide">
            COMMISSION ON ELECTIONS
          </div>
          <div className="text-xs">RIZAL, CALABARZON</div>
        </div>
        <div className="w-12"></div> 
      </div>
      <div className="text-xs mb-2 text-center">
        <span className="font-semibold">VIN:</span> XXXXXXXXXXXXXXXX
      </div>
      <div className="flex">
        <div>
          <Image
            src="/1x1.jpg"
            alt="Voter Photo"
            width={80}
            height={96}
            className="rounded object-cover"
            style={{ border: "1px solid #bbb" }}
          />
        </div>
        <div className="ml-4 flex-1">
          <div className="font-bold text-base leading-tight mb-3"> 
            OJA<br />
            MA. IZABELLE<br />
            LOPES
          </div>
          <div className="text-xs space-y-1"> 
            <div>
              <span className="font-bold inline-block w-20">Date of Birth</span>: December 14, 2004
            </div>
            <div>
              <span className="font-bold inline-block w-20">Civil Status</span>: Single
            </div>
            <div>
              <span className="font-bold inline-block w-20">Citizenship</span>: Filipino
            </div>
            <div>
              <span className="font-bold inline-block w-20">Address</span>: 118 A. Bonifacio St. Libid, Binangonan, Rizal
            </div>
            <div>
              <span className="font-bold inline-block w-20">Precinct No.</span>: 1234A
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-end mt-4"> 
        <div className="flex-1">
          <Image
            src="/signature.png"
            alt="Voter Signature"
            width={128}
            height={20}
            className="mb-1"
          />
          <div className="font-bold text-xs text-gray-600">Signature of Voter</div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs font-semibold">GEORGE ERWIN M. GARCIA</div>
          <div className="text-xs text-green-700 font-semibold">Chairman</div>
        </div>
      </div>
    </div>
  );
}