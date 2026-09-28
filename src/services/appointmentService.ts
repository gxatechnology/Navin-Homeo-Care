import { adminDataService, AdminAppointment } from './adminDataService';

export interface AppointmentBookingPayload {
  fullName: string;
  phone: string;
  email?: string;
  age?: string;
  patientType: 'new' | 'existing';
  preferredDate: string;
  preferredTime: string;
  healthConcern: string;
  symptomsNote?: string;
  consentAgreed: boolean;
  appointmentType?: string;
}

export interface QuickEnquiryPayload {
  name: string;
  phone: string;
  concern: string;
  message?: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  bookingReference?: string;
  timestamp: string;
}

const STORAGE_KEY_ENQUIRIES = 'navin_homeo_enquiries';

export async function submitAppointmentRequest(
  payload: AppointmentBookingPayload
): Promise<SubmissionResponse> {
  // Client-side validation checks
  if (!payload.fullName || payload.fullName.trim().length < 2) {
    throw new Error('Please enter your full name (at least 2 characters).');
  }

  const phoneDigits = payload.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    throw new Error('Please enter a valid 10-digit mobile number.');
  }

  if (!payload.preferredDate) {
    throw new Error('Please select your preferred appointment date.');
  }

  if (!payload.preferredTime) {
    throw new Error('Please choose a preferred OPD time slot.');
  }

  if (!payload.consentAgreed) {
    throw new Error('Please agree to be contacted regarding your appointment request.');
  }

  // Generate reference ID
  const refId = `NHC-${Math.floor(100000 + Math.random() * 900000)}`;
  const record: AdminAppointment = {
    bookingReference: refId,
    fullName: payload.fullName.trim(),
    phone: payload.phone.trim(),
    email: payload.email?.trim() || '',
    age: payload.age || '',
    patientType: payload.patientType || 'new',
    preferredDate: payload.preferredDate,
    preferredTime: payload.preferredTime,
    healthConcern: payload.healthConcern || 'General Consultation',
    symptomsNote: payload.symptomsNote?.trim() || '',
    timestamp: new Date().toISOString(),
    status: 'requested',
    source: 'Website',
    appointmentType: payload.appointmentType || 'In-Clinic OPD',
    internalNotes: [],
  };

  // 1. Immediately record in local storage data store
  adminDataService.recordPublicAppointment(record);

  // 2. Submit to shared persistent backend API
  try {
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      console.warn('Backend API returned non-200 status:', res.status);
    }
  } catch (err) {
    console.warn('Network request to /api/appointments failed (persisted locally):', err);
  }

  return {
    success: true,
    bookingReference: refId,
    timestamp: record.timestamp,
    message:
      'Thank you. Your appointment request has been received. The clinic will contact you to confirm availability.',
  };
}

export async function submitQuickEnquiry(
  payload: QuickEnquiryPayload
): Promise<SubmissionResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!payload.name || payload.name.trim().length < 2) {
    throw new Error('Please enter your name.');
  }

  const phoneDigits = payload.phone.replace(/\D/g, '');
  if (phoneDigits.length < 10) {
    throw new Error('Please enter a valid 10-digit phone number.');
  }

  const record = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  try {
    const existingStr = localStorage.getItem(STORAGE_KEY_ENQUIRIES);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(record);
    localStorage.setItem(STORAGE_KEY_ENQUIRIES, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }

  return {
    success: true,
    timestamp: record.timestamp,
    message:
      'Thank you! Your enquiry has been received. Our clinic desk will call you shortly.',
  };
}
