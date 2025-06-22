'use client';
import type { Application } from '@/types';

// This file is now deprecated - applications should be fetched from Supabase database
// Keeping minimal implementation for backward compatibility

export function getApplications(): Application[] {
  // Return empty array - applications should be fetched from database
  return [];
}

export function saveApplication(application: Application): void {
  // No-op - applications should be saved to database via API
  console.warn('saveApplication is deprecated. Use database API instead.');
}

export function getApplicationById(id: string): Application | undefined {
  // Return undefined - applications should be fetched from database
  console.warn('getApplicationById is deprecated. Use database API instead.');
  return undefined;
}

export function updateApplicationStatus(id: string, status: Application['status'], remarks?: string): Application | undefined {
  // No-op - applications should be updated in database via API
  console.warn('updateApplicationStatus is deprecated. Use database API instead.');
  return undefined;
}

export function deleteApplication(id: string): boolean {
  // No-op - applications should be deleted from database via API
  console.warn('deleteApplication is deprecated. Use database API instead.');
  return false;
}

export function clearAllApplications(): void {
  // No-op - this function is no longer needed
  console.warn('clearAllApplications is deprecated.');
}

export function deleteApplicationById(id: string): boolean {
  // No-op - applications should be deleted from database via API
  console.warn('deleteApplicationById is deprecated. Use database API instead.');
  return false;
}

export function seedInitialData(): void {
  // No-op - seed data should be managed via database
  console.warn('seedInitialData is deprecated. Use database seeding instead.');
}