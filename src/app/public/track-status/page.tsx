'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ApplicationTrackingTable } from '@/components/applications/ApplicationTrackingTable';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import type { Application, DocumentInfo } from '@/types';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TrackStatusPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadUserApplications = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('Loading applications for user:', user);
        
        // First, get the applicant record
        const { data: applicantData, error: applicantError } = await supabase
          .from('applicant')
          .select('applicant_id')
          .eq('auth_id', user.id);

        console.log('Applicant data:', applicantData, 'Error:', applicantError);

        if (applicantError) {
          console.error('Error fetching applicant:', applicantError);
          setApplications([]);
          setIsLoading(false);
          return;
        }

        if (!applicantData || applicantData.length === 0) {
          console.log('No applicant record found for user');
          setApplications([]);
          setIsLoading(false);  
          return;
        }

        // Fetch applications with all related data
        console.log('Fetching applications for applicant_id:', applicantData[0].applicant_id);
          const { data: userApplications, error } = await supabase
          .from('application')          .select(`
            application_number,
            public_facing_id,
            application_type,
            application_date,
            processing_date,
            status,
            reason_for_disapproval,
            erb_hearing_date,
            remarks,            applicant:applicant_id (
              applicant_id,
              first_name,
              last_name,
              middle_name,
              suffix,
              citizenship_type,
              date_of_naturalization,
              certificate_number,
              profession_occupation,
              contact_number,
              email_address,
              civil_status,
              spouse_name,
              sex,
              date_of_birth,
              place_of_birth_municipality,
              place_of_birth_province,              father_name,
              mother_maiden_name,
              special_sector:applicant_special_sector (
                is_illiterate,
                is_senior_citizen,
                tribe,
                type_of_disability,
                assistance_needed,
                assistor_name,
                vote_on_ground_floor
              )
            ),
            application_declared_address (
              house_number_street,
              barangay,
              city_municipality,
              province,
              months_of_residence_address,
              years_of_residence_address,
              months_of_residence_municipality,
              years_of_residence_municipality,
              years_in_country
            ),            application_registration (
              registration_type,
              adult_registration_consent,
              government_id_front_url,
              government_id_back_url,
              id_selfie_url
            ),
            application_transfer (
              previous_precinct_number,
              previous_barangay,
              previous_city_municipality,
              previous_province,
              previous_foreign_post,
              previous_country,
              transfer_type
            ),
            application_reactivation (
              reason_for_deactivation
            ),
            application_correction (
              target_field,
              requested_value,
              current_value
            ),
            application_reinstatement (
              reinstatement_type
            )
          `)
          .eq('applicant_id', applicantData[0].applicant_id)
          .order('application_date', { ascending: false });

        console.log('Raw applications data:', userApplications);
        console.log('Query error:', error);        if (error) {
          console.error('Error fetching user applications:', error);
          setApplications([]);
        } else {
          // Transform the data
          const transformedApps: Application[] = (userApplications || []).map(app => {
            const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;            const specialSector = applicant?.special_sector ? 
              (Array.isArray(applicant.special_sector) ? applicant.special_sector[0] : applicant.special_sector) : null;
            const address = Array.isArray(app.application_declared_address) ? app.application_declared_address[0] : app.application_declared_address;
            const registration = Array.isArray(app.application_registration) ? app.application_registration[0] : app.application_registration;
            const transfer = Array.isArray(app.application_transfer) ? app.application_transfer[0] : app.application_transfer;
            const reactivation = Array.isArray(app.application_reactivation) ? app.application_reactivation[0] : app.application_reactivation;
            const correction = Array.isArray(app.application_correction) ? app.application_correction[0] : app.application_correction;
            const reinstatement = Array.isArray(app.application_reinstatement) ? app.application_reinstatement[0] : app.application_reinstatement;
            
            console.log('Special sector data for application:', app.application_number, specialSector);
            
            return {
              // Main application data
              applicationNumber: app.application_number,
              id: app.public_facing_id || `APP-${String(app.application_number).padStart(6, '0')}`,
              applicantId: applicant?.applicant_id,
              applicationType: app.application_type,
              applicationDate: app.application_date,
              processingDate: app.processing_date,
              status: app.status,
              reasonForDisapproval: app.reason_for_disapproval,
              erbHearingDate: app.erb_hearing_date,
              remarks: app.remarks || undefined,

              // Personal information from applicant table
              personalInfo: {
                firstName: applicant?.first_name || 'Unknown',
                lastName: applicant?.last_name || 'User',
                middleName: applicant?.middle_name || '',
                suffix: applicant?.suffix || '',
                citizenshipType: applicant?.citizenship_type || 'By Birth',
                dateOfNaturalization: applicant?.date_of_naturalization,
                certificateNumber: applicant?.certificate_number,
                professionOccupation: applicant?.profession_occupation || '',
                contactNumber: applicant?.contact_number || '',
                emailAddress: applicant?.email_address || '',
                civilStatus: applicant?.civil_status || 'Single',
                spouseName: applicant?.spouse_name || '',
                sex: applicant?.sex || 'M',
                dateOfBirth: applicant?.date_of_birth || '',
                placeOfBirthMunicipality: applicant?.place_of_birth_municipality || '',
                placeOfBirthProvince: applicant?.place_of_birth_province || '',
                fatherName: applicant?.father_name || '',
                motherMaidenName: applicant?.mother_maiden_name || ''
              },              // Address details from application_declared_address table
              addressDetails: address ? {
                houseNumberStreet: address.house_number_street || '',
                barangay: address.barangay || '',
                cityMunicipality: address.city_municipality || '',
                province: address.province || '',
                monthsOfResidenceAddress: address.months_of_residence_address || 0,
                yearsOfResidenceAddress: address.years_of_residence_address || 0,
                monthsOfResidenceMunicipality: address.months_of_residence_municipality || 0,
                yearsOfResidenceMunicipality: address.years_of_residence_municipality || 0,
                yearsInCountry: address.years_in_country || 0
              } : undefined,              // Special sector details from applicant_special_sector table
              specialSector: specialSector ? {
                isIlliterate: specialSector.is_illiterate || false,
                isSeniorCitizen: specialSector.is_senior_citizen || false,
                tribe: specialSector.tribe || '',
                typeOfDisability: specialSector.type_of_disability || '',
                assistanceNeeded: specialSector.assistance_needed || '',
                assistorName: specialSector.assistor_name || '',
                voteOnGroundFloor: specialSector.vote_on_ground_floor || false
              } : {
                isIlliterate: false,
                isSeniorCitizen: false,
                tribe: '',
                typeOfDisability: '',
                assistanceNeeded: '',
                assistorName: '',
                voteOnGroundFloor: false
              },// Registration details
              registration: registration ? {
                registrationType: registration.registration_type || 'Regular',
                adultRegistrationConsent: registration.adult_registration_consent,
                governmentIdFrontUrl: registration.government_id_front_url || '',
                governmentIdBackUrl: registration.government_id_back_url || '',
                idSelfieUrl: registration.id_selfie_url || ''
              } : undefined,

              // Transfer details
              transfer: transfer ? {
                previousPrecinctNumber: transfer.previous_precinct_number,
                previousBarangay: transfer.previous_barangay,
                previousCityMunicipality: transfer.previous_city_municipality,
                previousProvince: transfer.previous_province,
                previousForeignPost: transfer.previous_foreign_post,
                previousCountry: transfer.previous_country,
                transferType: transfer.transfer_type
              } : undefined,
              
              // Reactivation details
              reactivation: reactivation ? {
                reasonForDeactivation: reactivation.reason_for_deactivation
              } : undefined,
              
              // Correction details
              correction: correction ? {
                targetField: correction.target_field,
                requestedValue: correction.requested_value,
                currentValue: correction.current_value
              } : undefined,

              // Reinstatement details
              reinstatement: reinstatement ? {
                reinstatementType: reinstatement.reinstatement_type
              } : undefined,

              // Documents array
              documents: [
                ...(registration?.government_id_front_url ? [{
                  name: 'Government ID (Front)',
                  url: registration.government_id_front_url,
                  type: 'government_id_front' as const,
                  uploadDate: app.application_date
                }] : []),
                ...(registration?.government_id_back_url ? [{
                  name: 'Government ID (Back)',
                  url: registration.government_id_back_url,
                  type: 'government_id_back' as const,
                  uploadDate: app.application_date
                }] : []),
                ...(registration?.id_selfie_url ? [{
                  name: 'ID Selfie',
                  url: registration.id_selfie_url,
                  type: 'id_selfie' as const,
                  uploadDate: app.application_date
                }] : [])
              ],

              // Legacy fields for backward compatibility
              submissionDate: app.application_date,
              approvalDate: app.processing_date
            };
          });
          
          console.log('Transformed applications:', transformedApps);
          setApplications(transformedApps);
        }
      } catch (error) {
        console.error('Failed to load applications:', error);
        setApplications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserApplications();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="mr-3 h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight text-primary">
            Application Tracking
          </h2>
        </div>
        <Button variant="outline" className="bg-white hover:bg-yellow-400" asChild>
          <Link href="/public/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            Track the status of all your voter registration applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium">No applications found</p>
              <p className="text-sm">You haven't submitted any applications yet.</p>
              <div className="mt-4">
                <Button asChild variant="default">
                  <Link href="/public/apply">Submit Your First Application</Link>
                </Button>
              </div>
            </div>
          ) : (
            <ApplicationTrackingTable applications={applications} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}