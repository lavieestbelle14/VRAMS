import React from "react";

export default function VoterIdCard() {
  return (
    <div
      className="max-w-md mx-auto rounded-xl border bg-white shadow-lg p-6 relative"
      style={{
        fontFamily: "Arial, sans-serif",
        width: 420,
        background: "linear-gradient(135deg, #f8fafc 80%, #e2e8f0 100%)",
      }}
    >
      <div className="flex items-center mb-2">
        <img
            src="/ph-comelec-logo.png"
            alt="COMELEC Logo"
            className="h-12 w-12 mr-3"
            />
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide">
            Republic of the Philippines
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide">
            COMMISSION ON ELECTIONS
          </div>
          <div className="text-xs">QUEZON CITY, NCR - SECOND DISTRICT</div>
        </div>
      </div>
      <div className="text-xs mb-2">
        <span className="font-semibold">VIN:</span> XXXXXXXXXXXXXXXX
      </div>
      <div className="flex">
        <div>
          <div
            className="h-24 w-20 bg-gray-300 rounded mb-2 flex items-center justify-center text-xs text-gray-500"
            style={{ border: "1px solid #bbb" }}
          >
            Photo
          </div>
        </div>
        <div className="ml-4 flex-1">
          <div className="font-bold text-base leading-tight mb-1">
            OJA<br />
            MA. IZABELLE<br />
            LOPES
          </div>
          <div className="text-xs">
            <div>
              <span className="inline-block w-20">Date of Birth</span>: December 14, 2004
            </div>
            <div>
              <span className="inline-block w-20">Civil Status</span>: Single
            </div>
            <div>
              <span className="inline-block w-20">Citizenship</span>: Filipino
            </div>
            <div>
              <span className="inline-block w-20">Address</span>: 118 A. Bonifacio St. Libid, Binangonan, Rizal
            </div>
            <div>
              <span className="inline-block w-20">Precinct No.</span>: 1234A
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-4">
        <div className="flex-1">
          <div
            className="h-6 w-32 bg-gray-200 rounded mb-1"
            style={{ border: "1px solid #bbb" }}
          >
            {/* Signature placeholder */}
          </div>
          <div className="text-xs text-gray-600">Signature of Voter</div>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs font-semibold">GEORGE ERWIN M. GARCIA</div>
          <div className="text-xs text-green-700 font-semibold">Chairman</div>
        </div>
      </div>
    </div>
  );
}