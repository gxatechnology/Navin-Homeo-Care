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

const STORAGE_KEY_APPOINTMENTS = 'navin_homeo_appointments';
const STORAGE_KEY_ENQUIRIES = 'navin_homeo_enquiries';

export async function submitAppointmentRequest(
  payload: AppointmentBookingPayload
): Promise<SubmissionResponse> {
  // Simulate network request latency (500ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

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
  const record = {
    ...payload,
    bookingReference: refId,
    timestamp: new Date().toISOString(),
    status: 'received',
  };

  // Persist locally so clinic receptionist / user can inspect past requests
  try {
    const existingStr = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    const existing = existingStr ? JSON.parse(existingStr) : [];
    existing.unshift(record);
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
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
