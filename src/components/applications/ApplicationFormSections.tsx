import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { ApplicationFormValues } from '@/schemas/applicationSchema';
import {
  FormSection,
  ApplicationTypeFields,
  RegistrationTypeFields,
  TransferFields,
  AddressResidencyFields,
  ReactivationFields,
  CorrectionOfEntryFields,
  InclusionReinstatementFields,
  PersonalInformationFields,
  IdVerificationFields,
  ThumbprintsSignaturesFields,
  RegularOathFields,
  KatipunanOathFields,
  DisableableSection,
} from './form-fields';

interface ApplicationFormSectionsProps {
  form: UseFormReturn<ApplicationFormValues>;
  isRegistered: boolean;
  shouldDisableSection: boolean;
  shouldDisableOath: boolean;
  registrationType: string;
  citizenshipType: string;
  civilStatus: string;
  assistorName: string | undefined;
  isIndigenousPerson: boolean;
  isPwd: boolean;
}

export function ApplicationFormSections({
  form,
  isRegistered,
  shouldDisableSection,
  shouldDisableOath,
  registrationType,
  citizenshipType,
  civilStatus,
  assistorName,
  isIndigenousPerson,
  isPwd,
}: ApplicationFormSectionsProps) {
  const applicationType = form.watch('applicationType');

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-semibold text-center mb-2">
            Voter Registration Application Form
          </h2>
          <p className="text-center text-muted-foreground">
            Please fill out all required fields accurately. This information will be used for your official voter registration.
            Ensure all details match your official documents.
          </p>
        </CardContent>
      </Card>

      {/* Application Type Section */}
      <FormSection title="Application Type" description="">
        <ApplicationTypeFields 
          control={form.control}
          form={form}
          isRegistered={isRegistered}
        />
      </FormSection>

      {/* Registration Type Section - Only show for register application type */}
      {applicationType === 'register' && (
        <FormSection title="Registration Type" description="Select the type of registration you wish to apply for.">
          <RegistrationTypeFields control={form.control} />
        </FormSection>
      )}

      {/* Fields for TRANSFER WITH REACTIVATION application type */}
      {applicationType === 'transfer_with_reactivation' && (
        <>
          <FormSection 
            title="Application for Transfer with Reactivation" 
            description="Provide details of your previous registration for transfer and the reason for deactivation."
          >
            <TransferFields control={form.control} />
          </FormSection>

          <FormSection 
            title="New Residence Information for Transfer" 
            description="Provide your new address details and residency period for the transfer."
          >
            <DisableableSection isDisabled={false}>
              <AddressResidencyFields control={form.control} />
            </DisableableSection>
          </FormSection>

          <FormSection 
            title="Reason for Deactivation" 
            description="Provide the reason your record was deactivated."
          >
            <ReactivationFields control={form.control} />
          </FormSection>
        </>
      )}

      {/* Fields for TRANSFER application type */}
      {applicationType === 'transfer' && (
        <>
          <FormSection 
            title="Application for Transfer of Registration Record" 
            description="Provide details of your previous registration for transfer."
          >
            <TransferFields control={form.control} />
          </FormSection>

          <FormSection 
            title="New Residence Information for Transfer" 
            description="Provide your new address details and residency period for the transfer."
          >
            <DisableableSection isDisabled={false}>
              <AddressResidencyFields control={form.control} />
            </DisableableSection>
          </FormSection>
        </>
      )}

      {/* Fields for REACTIVATION application type */}
      {applicationType === 'reactivation' && (
        <FormSection title="Reason for Deactivation" description="Provide the reason your record was deactivated.">
          <ReactivationFields control={form.control} />
        </FormSection>
      )}
      
      {/* Fields for CORRECTION OF ENTRY application type */}
      {applicationType === 'correction_of_entry' && (
        <FormSection title="Correction of Entries" description="">
          <CorrectionOfEntryFields control={form.control} />
        </FormSection>
      )}

      {/* Fields for REINSTATEMENT application type */}
      {applicationType === 'reinstatement' && (
        <FormSection title="Application for Inclusion/Reinstatement" description="Request to include or reinstate your name/record in the precinct book of voters.">
          <InclusionReinstatementFields control={form.control} />
        </FormSection>
      )}

      {/* Personal Information, ID Verification, and Thumbprints/Signatures Sections - Only show for register application type */}
      {applicationType === 'register' && (
        <>
          <FormSection 
            title="Part 1: PERSONAL INFORMATION" 
            description="To be filled out by Applicant. Includes personal details, citizenship, profession, civil status, and special needs information."
          >
            <DisableableSection isDisabled={shouldDisableSection}>
              <PersonalInformationFields 
                control={form.control}
                citizenshipType={citizenshipType}
                civilStatus={civilStatus}
                isIndigenousPerson={isIndigenousPerson}
                isPwd={isPwd}
                assistorName={assistorName}
              />
            </DisableableSection>
          </FormSection>

          <FormSection 
            title="Residence, Address, and Period of Residence" 
            description="Provide your current address details and how long you've lived in your current area and in the Philippines."
          >
            <DisableableSection isDisabled={shouldDisableSection}>
              <AddressResidencyFields control={form.control} />
            </DisableableSection>
          </FormSection>

          <FormSection 
            title="ID Verification" 
            description="Required for new registrations. Upload clear photos of your valid ID and a selfie."
          >
            <DisableableSection isDisabled={applicationType !== 'register'}>
              <IdVerificationFields control={form.control} />
            </DisableableSection>
          </FormSection>

          <FormSection 
            title="ROLLED THUMBPRINTS / SPECIMEN SIGNATURES" 
            description="To be captured on-site at COMELEC office"
          >
            <ThumbprintsSignaturesFields control={form.control} />
          </FormSection>
        </>
      )}

      {/* PART 2 - Dynamic Oath Sections based on Registration Type */}
      {applicationType === 'register' && registrationType === 'Regular' && (
        <FormSection title="PART 2: OATH, NOTICE and CONSENT (REGULAR)" description="">
          <RegularOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
        </FormSection>
      )}

      {applicationType === 'register' && registrationType === 'Katipunan ng Kabataan' && (
        <FormSection title="Part 2: OATH, NOTICE and CONSENT (KATIPUNAN NG KABATAAN)" description="">
          <KatipunanOathFields control={form.control} shouldDisableOath={shouldDisableOath} />
        </FormSection>
      )}
    </>
  );
}
