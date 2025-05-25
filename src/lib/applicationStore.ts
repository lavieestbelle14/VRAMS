
'use client';
import type { Application } from '@/types';

const APPLICATIONS_KEY = 'vrams_applications_data';
let memoryStore: Application[] | null = null;


function initializeStore(): Application[] {
  if (typeof window === 'undefined') return [];
  if (memoryStore !== null) return memoryStore;

  const data = localStorage.getItem(APPLICATIONS_KEY);
  memoryStore = data ? JSON.parse(data) : [];
  return memoryStore;
}


export function getApplications(): Application[] {
  return initializeStore();
}

export function saveApplication(application: Application): void {
  if (typeof window === 'undefined') return;
  const applications = initializeStore();
  const index = applications.findIndex(app => app.id === application.id);
  if (index > -1) {
    applications[index] = application;
  } else {
    applications.unshift(application); // Add new applications to the beginning
  }
  localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
  memoryStore = [...applications]; // Update memory store
}

export function getApplicationById(id: string): Application | undefined {
  return initializeStore().find(app => app.id === id);
}

export function updateApplicationStatus(id: string, status: Application['status'], remarks?: string): Application | undefined {
  if (typeof window === 'undefined') return undefined;
  const applications = initializeStore();
  const appIndex = applications.findIndex(app => app.id === id);
  if (appIndex > -1) {
    applications[appIndex].status = status;
    if (remarks) applications[appIndex].remarks = remarks;
    if (status === 'approved') {
      applications[appIndex].approvalDate = new Date().toISOString();
      if(!applications[appIndex].voterId) { 
        applications[appIndex].voterId = `VID-${applications[appIndex].id.substring(0,4)}-${new Date().getTime().toString().slice(-5)}`;
      }
      if(!applications[appIndex].precinct) { 
         applications[appIndex].precinct = `Precinct ${Math.floor(Math.random() * 1000) + 1}`;
      }
    }
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
    memoryStore = [...applications];
    return applications[appIndex];
  }
  return undefined;
}

export function seedInitialData() {
  if (typeof window === 'undefined') return;
  const apps = getApplications();
  if (apps.length === 0) {
    const sampleApplications: Application[] = [
      {
        id: 'APP-001',
        personalInfo: { 
          firstName: 'Juan', lastName: 'Dela Cruz', middleName: 'Protacio',
          sex: 'male', dob: '1990-01-15', 
          placeOfBirthCityMun: 'Manila', placeOfBirthProvince: 'Metro Manila',
          citizenshipType: 'byBirth', 
          contactNumber: '09171234567', email: 'juan.delacruz@example.com',
          residencyYearsCityMun: 5, residencyMonthsCityMun: 6, residencyYearsPhilippines: 30,
          professionOccupation: 'Engineer', tin: '123-456-789-000'
        },
        addressDetails: { 
          houseNoStreet: '123 Rizal St', barangay: 'Pembo', cityMunicipality: 'Makati', 
          province: 'Metro Manila', zipCode: '1218',
          yearsOfResidency: 5, monthsOfResidency: 6
        },
        civilDetails: { 
          civilStatus: 'single', 
          fatherFirstName: 'Pedro', fatherLastName: 'Dela Cruz', 
          motherFirstName: 'Maria', motherLastName: 'Santos' 
        },
        specialNeeds: {
          isIlliterate: false, isPwd: false, isIndigenousPerson: false,
          prefersGroundFloor: false, isSenior: false
        },
        applicationType: 'register',
        biometricsFile: "Captured on-site",
        status: 'pending',
        submissionDate: new Date(Date.now() - 86400000 * 5).toISOString(), 
        classification: { applicantType: 'new registration', confidence: 0.95, reason: 'All fields indicate a new applicant.'}
      },
      {
        id: 'APP-002',
        personalInfo: { 
          firstName: 'Maria', lastName: 'Clara', middleName: 'Santos',
          sex: 'female', dob: '1985-05-20', 
          placeOfBirthCityMun: 'Cebu City', placeOfBirthProvince: 'Cebu',
          citizenshipType: 'byBirth',
          professionOccupation: 'Doctor'
        },
        addressDetails: { 
          houseNoStreet: '456 Bonifacio Ave', barangay: 'Lahug', cityMunicipality: 'Cebu City', 
          province: 'Cebu', zipCode: '6000',
          yearsOfResidency: 2, monthsOfResidency: 0
        },
        oldAddressDetails: { 
            houseNoStreet: '789 Aguinaldo St', barangay: 'Kamputhaw', cityMunicipality: 'Cebu City', 
            province: 'Cebu', zipCode: '6000' 
        },
        civilDetails: { 
            civilStatus: 'married', spouseName: 'Jose Rizal', 
            fatherFirstName: 'Santiago', fatherLastName: 'Santos', 
            motherFirstName: 'Teodora', motherLastName: 'Alonso' 
        },
        specialNeeds: { 
            isSenior: true, isPwd: false, isIndigenousPerson: false, isIlliterate: false, prefersGroundFloor: true 
        },
        applicationType: 'transfer',
        status: 'approved',
        submissionDate: new Date(Date.now() - 86400000 * 10).toISOString(), 
        approvalDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        voterId: 'VID-APP002-54321',
        precinct: 'Precinct 007B',
        classification: { applicantType: 'transfer', confidence: 0.98, reason: 'Application type is transfer and old address provided.'}
      },
       {
        id: 'APP-003',
        personalInfo: { 
            firstName: 'Andres', lastName: 'Bonifacio', 
            sex: 'male', dob: '1970-11-30', 
            placeOfBirthCityMun: 'Tondo', placeOfBirthProvince: 'Manila',
            citizenshipType: 'byBirth',
            professionOccupation: 'Revolutionary'
        },
        addressDetails: { 
            houseNoStreet: '101 Katipunan Rd', barangay: 'Loyola Heights', cityMunicipality: 'Quezon City', 
            province: 'Metro Manila', zipCode: '1108',
            yearsOfResidency: 10 
        },
        civilDetails: { 
            civilStatus: 'married', spouseName: 'Gregoria de Jesus',
            fatherFirstName: 'Santiago', fatherLastName: 'Bonifacio', 
            motherFirstName: 'Catalina', motherLastName: 'de Castro' 
        },
        specialNeeds: { 
            isSenior: true, isPwd: true, disabilityType: 'Mobility Impairment', 
            assistorName: 'Oryang', assistorRelationship: 'Spouse', assistorAddress: 'Same as applicant',
            prefersGroundFloor: true, isIlliterate: false, isIndigenousPerson: false
        },
        applicationType: 'reactivation',
        reactivationReasons: ['failedToVote'],
        reactivationEvidence: 'Affidavit of intent to vote.',
        status: 'rejected',
        submissionDate: new Date(Date.now() - 86400000 * 3).toISOString(),
        remarks: 'Incomplete supporting documents for PWD status.',
        classification: { applicantType: 'reactivation', confidence: 0.90, reason: 'Applicant selected failed to vote as reason.'}
      }
    ];
    sampleApplications.forEach(app => saveApplication(app));
    memoryStore = [...sampleApplications];
  }
}
