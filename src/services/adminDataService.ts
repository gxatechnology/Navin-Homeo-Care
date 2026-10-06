import {
  ProductItem,
  PRODUCTS_DATA,
  ProductCategory,
  isProductExpired,
  isProductExpiringSoon,
  getProductStockStatus,
} from '../config/productsData';
import { CLINIC_CONFIG, ReviewItem, REVIEWS_DATA } from '../config/clinicData';
import { Order, getStoredOrders, saveOrder, OrderStatus } from './orderService';
import { auditLogService } from './auditLogService';
import { adminAuthService } from './adminAuthService';

export function getAdminAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  try {
    const session = adminAuthService.getSession();
    if (session?.token) {
      headers['Authorization'] = `Bearer ${session.token}`;
    }
  } catch {
    // ignore
  }
  return headers;
}

// ==================== SECTION 13: DATABASE TABLES / STORAGE KEYS ====================
export const DB_KEYS = {
  ADMINS: 'nhc_db_admins_v1',
  APPOINTMENTS: 'navin_homeo_appointments',
  ORDERS: 'navin_homeo_orders_v1',
  ORDER_ITEMS: 'nhc_db_order_items_v1',
  PRODUCTS: 'navin_homeo_admin_products',
  CUSTOMERS: 'nhc_db_customers_v1',
  ENQUIRIES: 'navin_homeo_enquiries',
  INVENTORY_LOGS: 'nhc_db_inventory_logs_v1',
  NOTIFICATIONS: 'nhc_db_notifications_v1',
  SETTINGS: 'navin_homeo_admin_settings',
  AUDIT_LOGS: 'nhc_audit_logs_v1',
};

export type AppointmentStatus = 'requested' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type EnquiryStatus = 'new' | 'contacted' | 'resolved';
export type AppointmentSource = 'Website' | 'Phone' | 'WhatsApp' | 'Walk-in' | 'Admin Entry' | string;

export type NotificationType =
  | 'new_appointment'
  | 'new_order'
  | 'appointment_cancelled'
  | 'order_cancelled'
  | 'low_stock'
  | 'out_of_stock'
  | 'refund_processed';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
  targetPath: string;
}

// Section 5: Renamed to Internal Appointment Notes
export interface InternalAppointmentNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface AdminAppointment {
  bookingReference: string;
  fullName: string;
  phone: string;
  email?: string;
  age?: string;
  patientType: 'new' | 'existing';
  preferredDate: string;
  preferredTime: string;
  healthConcern: string;
  symptomsNote?: string;
  timestamp: string;
  status: AppointmentStatus;
  internalNotes: InternalAppointmentNote[];
  rescheduledFrom?: string;
  source?: AppointmentSource;
  appointmentType?: string;
}

export interface AdminEnquiry {
  id: string;
  name: string;
  phone: string;
  concern: string;
  message?: string;
  timestamp: string;
  status: EnquiryStatus;
  adminResponse?: string;
}

export interface AdminReview extends ReviewItem {
  status: 'published' | 'pending' | 'hidden';
}

// Section 11: Settings specifications
export interface ClinicSettings {
  // Clinic Settings
  clinicName: string;
  doctorName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsLink: string;
  clinicTimings: string;

  // Appointment Settings
  appointmentAvailability: boolean;
  consultationTimings: string;
  showConsultationFees: boolean;
  clinicFee?: number;
  onlineFee?: number;

  // Shop Settings
  shippingFee: number;
  freeShippingThreshold: number;
  codAvailable: boolean;
  onlinePaymentAvailable: boolean;
  lowStockThreshold: number;
  orderPrefix: string;

  // Optional fields - only displayed if verified data supplied
  drugLicenseNumber?: string;
  gstNumber?: string;
  medicalRegistrationNumber?: string;

  // Announcement bar
  announcementActive: boolean;
  announcementText: string;
}

// Section 4: Privacy-Preserving Customer Summary
// Excludes private medical symptoms, concerns, or consultation notes from general customer/sales views
export interface CustomerSummary {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  totalAppointments: number;
  totalOrders: number;
  totalPurchaseValue: number;
  lastAppointmentDate?: string;
  lastOrderDate?: string;
  orders: {
    id: string;
    createdAt: string;
    total: number;
    status: string;
    itemCount: number;
  }[];
  appointments: {
    bookingReference: string;
    preferredDate: string;
    preferredTime: string;
    status: AppointmentStatus;
  }[];
}

export type InventoryChangeReason =
  | 'Stock Added'
  | 'Manual Adjustment'
  | 'Order'
  | 'Cancellation'
  | 'Return'
  | 'Purchase / New Batch Restock'
  | 'Sale / Clinic Dispense'
  | 'Inventory Count Correction'
  | 'Damaged / Broken'
  | 'Expired Stock Write-off'
  | 'Doctor Sample / Demo'
  | 'Initial Stock'
  | 'Product Edit Adjustment'
  | string;

export interface InventoryLogEntry {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  changeAmount: number;
  changeReason: InventoryChangeReason;
  note?: string;
  timestamp: string;
  adminAccount: string;
}

// Initial realistic clinic appointment records
const INITIAL_APPOINTMENTS: AdminAppointment[] = [
  {
    bookingReference: 'NHC-829104',
    fullName: 'Rajesh Srivastava',
    phone: '09415012345',
    email: 'rajesh.sri@example.com',
    age: '46',
    patientType: 'existing',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '10:30 AM - 11:30 AM',
    healthConcern: 'Joint & Back Pain (Cervical Spondylosis)',
    symptomsNote: 'Recurring neck stiffness after laptop work and morning stiffness in knee joints.',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'confirmed',
    internalNotes: [
      {
        id: 'n1',
        author: 'Admin Desk',
        text: 'Follow-up consultation. Token 3 allocated for morning OPD.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    bookingReference: 'NHC-910283',
    fullName: 'Pooja Verma',
    phone: '09839067890',
    email: 'pooja.verma@example.com',
    age: '29',
    patientType: 'new',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '06:00 PM - 07:00 PM',
    healthConcern: 'Skin & Hair Problems (Chronic Eczema)',
    symptomsNote: 'Dry itchy patches on forearms aggravated during season changes.',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'requested',
    internalNotes: [
      {
        id: 'n2',
        author: 'Admin Desk',
        text: 'New patient requested evening consultation. Called once, requested callback after 4 PM.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ],
  },
  {
    bookingReference: 'NHC-746291',
    fullName: 'Mohd. Imran',
    phone: '08765432109',
    email: 'imran.m@example.com',
    age: '38',
    patientType: 'new',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '11:30 AM - 12:30 PM',
    healthConcern: 'Allergy & Breathing Concerns (Sinusitis)',
    symptomsNote: 'Continuous morning sneezing, dust sensitivity and recurrent frontal headache.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'confirmed',
    internalNotes: [
      {
        id: 'n3',
        author: 'Dr. Navin Desk',
        text: 'Advised to bring previous sinus X-rays and allergy reports.',
        createdAt: new Date(Date.now() - 72000000).toISOString(),
      },
    ],
  },
  {
    bookingReference: 'NHC-635190',
    fullName: 'Sunita Sharma',
    phone: '09335198765',
    email: 'sunita.sharma@example.com',
    age: '34',
    patientType: 'existing',
    preferredDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    preferredTime: '07:00 PM - 08:00 PM',
    healthConcern: 'Digestive Problems (GERD & Acidity)',
    symptomsNote: 'Chronic hyperacidity and post-meal bloating.',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'completed',
    internalNotes: [
      {
        id: 'n4',
        author: 'Dr. Navin Desk',
        text: 'Consultation completed. Advised lifestyle guidance and follow-up.',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
  },
  {
    bookingReference: 'NHC-528419',
    fullName: 'Ananya Gupta',
    phone: '09123456780',
    email: 'ananya.g@example.com',
    age: '24',
    patientType: 'new',
    preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    preferredTime: '05:00 PM - 06:00 PM',
    healthConcern: 'Women’s Health (PCOS Consultation)',
    symptomsNote: 'Irregular cycles and hormonal concerns.',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'requested',
    internalNotes: [],
  },
  {
    bookingReference: 'NHC-419827',
    fullName: 'Devendra Pandey',
    phone: '09988776655',
    age: '58',
    patientType: 'existing',
    preferredDate: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    preferredTime: '10:00 AM - 11:00 AM',
    healthConcern: 'Joint & Back Pain (Sciatica)',
    symptomsNote: 'Radiating pain from lower spine down the right leg.',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'no_show',
    internalNotes: [
      {
        id: 'n5',
        author: 'Admin Desk',
        text: 'Patient did not arrive. Out of station, will rebook next week.',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
    ],
  },
];

// Initial realistic website enquiries
const INITIAL_ENQUIRIES: AdminEnquiry[] = [
  {
    id: 'ENQ-101',
    name: 'Vikas Tiwari',
    phone: '09450011223',
    concern: 'Sunday OPD Consultation Slot',
    message: 'Can I get a prior slot for Dr. Navin Maurya this Sunday morning for my mother?',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'new',
  },
  {
    id: 'ENQ-102',
    name: 'Meenakshi Rastogi',
    phone: '09838123456',
    concern: 'Product Shipping to Kanpur',
    message: 'Can wellness supportive items be dispatched via standard courier to Kanpur?',
    timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'contacted',
    adminResponse: 'Contacted customer and guided through online shop checkout.',
  },
  {
    id: 'ENQ-103',
    name: 'Amitabh Mishra',
    phone: '09335678901',
    concern: 'Child Health Consultation',
    message: 'My 5-year-old son has recurrent cold during season changes. Do you offer pediatric homeopathic consultations?',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'resolved',
    adminResponse: 'Explained pediatric consultation procedure and booked OPD slot.',
  },
];

// Initial realistic Notifications Center records
const INITIAL_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-1',
    type: 'new_appointment',
    title: 'New Appointment Request',
    message: 'Pooja Verma requested Skin & Hair Care consultation for today (06:00 PM).',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    relatedId: 'NHC-910283',
    targetPath: '/admin/appointments',
  },
  {
    id: 'notif-2',
    type: 'new_order',
    title: 'New Shop Order Received',
    message: 'Anoop Verma placed order NHC-ORD-9281 (Total: ₹560).',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    read: false,
    relatedId: 'NHC-ORD-9281',
    targetPath: '/admin/orders',
  },
  {
    id: 'notif-3',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Natural Calendula Soothing Skin Cream has reached low stock threshold (10 units).',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    read: false,
    relatedId: 'prod-01',
    targetPath: '/admin/products',
  },
  {
    id: 'notif-4',
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: 'Appointment NHC-419827 for Devendra Pandey marked as No-Show / Cancelled.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    read: true,
    relatedId: 'NHC-419827',
    targetPath: '/admin/appointments',
  },
  {
    id: 'notif-5',
    type: 'order_cancelled',
    title: 'Order Cancelled',
    message: 'Order NHC-ORD-7712 was cancelled per customer phone request.',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    read: true,
    relatedId: 'NHC-ORD-7712',
    targetPath: '/admin/orders',
  },
  {
    id: 'notif-6',
    type: 'out_of_stock',
    title: 'Product Out of Stock',
    message: 'Digestive Comfort Carminative Drops is currently out of stock (0 units).',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    read: true,
    relatedId: 'prod-04',
    targetPath: '/admin/products',
  },
  {
    id: 'notif-7',
    type: 'refund_processed',
    title: 'Refund Processed',
    message: 'Refund of ₹340 recorded for returned item in Order NHC-ORD-6540.',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    read: true,
    relatedId: 'NHC-ORD-6540',
    targetPath: '/admin/orders',
  },
];

// Initial realistic Inventory Log history
const INITIAL_INVENTORY_LOGS: InventoryLogEntry[] = [
  {
    id: 'inv-001',
    productId: 'prod-01',
    productName: 'Natural Calendula Soothing Skin Cream',
    previousStock: 26,
    newStock: 24,
    changeAmount: -2,
    changeReason: 'Order',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    adminAccount: 'navin@navinhomeocare.com',
  },
  {
    id: 'inv-002',
    productId: 'prod-02',
    productName: 'Arnica Montana Hair Nourishing Oil',
    previousStock: 15,
    newStock: 35,
    changeAmount: 20,
    changeReason: 'Stock Added',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    adminAccount: 'navin@navinhomeocare.com',
  },
  {
    id: 'inv-003',
    productId: 'prod-03',
    productName: 'Berberis Aquifolium Clear Complexion Gel',
    previousStock: 18,
    newStock: 17,
    changeAmount: -1,
    changeReason: 'Manual Adjustment',
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
    adminAccount: 'navin@navinhomeocare.com',
  },
  {
    id: 'inv-004',
    productId: 'prod-04',
    productName: 'Digestive Comfort Carminative Drops',
    previousStock: 5,
    newStock: 0,
    changeAmount: -5,
    changeReason: 'Order',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
    adminAccount: 'navin@navinhomeocare.com',
  },
  {
    id: 'inv-005',
    productId: 'prod-01',
    productName: 'Natural Calendula Soothing Skin Cream',
    previousStock: 23,
    newStock: 24,
    changeAmount: 1,
    changeReason: 'Return',
    timestamp: new Date(Date.now() - 86400000 * 6).toISOString(),
    adminAccount: 'navin@navinhomeocare.com',
  },
];

// Default Clinic & Website Settings conforming to Section 11
const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: 'Navin Homeo Care',
  doctorName: 'Dr. Navin Maurya',
  phone: '073183 06699',
  whatsapp: '917318306699',
  email: 'navin@navinhomeocare.com',
  address: 'Shop No. 4, Ground Floor, Near Phoenix United Mall, Kanpur Road, Alambagh, Lucknow - 226005',
  googleMapsLink: 'https://maps.google.com/?q=Navin+Homeo+Care+Alambagh+Lucknow',
  clinicTimings: 'Mon-Thu: 10:00 AM - 01:30 PM & 05:30 PM - 08:30 PM | Fri-Sat: Closed | Sun: 10:00 AM - 02:00 PM',

  appointmentAvailability: true,
  consultationTimings: 'Morning OPD: 10:00 AM - 01:30 PM | Evening OPD: 05:30 PM - 08:30 PM',
  showConsultationFees: false, // Do not display fees unless explicitly configured
  clinicFee: 300,
  onlineFee: 400,

  shippingFee: 40,
  freeShippingThreshold: 500,
  codAvailable: true,
  onlinePaymentAvailable: false,
  lowStockThreshold: 10,
  orderPrefix: 'NHC-ORD-',

  announcementActive: true,
  announcementText: 'Consultations are scheduled by prior appointment. Book your slot online or call reception.',
};

export const adminDataService = {
  // ==================== APPOINTMENTS ====================
  getAppointments(): AdminAppointment[] {
    if (typeof window === 'undefined') return INITIAL_APPOINTMENTS;
    try {
      const raw = localStorage.getItem(DB_KEYS.APPOINTMENTS);
      if (!raw) {
        localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
        return INITIAL_APPOINTMENTS;
      }
      const data = JSON.parse(raw);
      return data.map((item: any) => ({
        bookingReference: item.bookingReference || `NHC-${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: item.fullName || 'Unnamed Patient',
        phone: item.phone || '',
        email: item.email || '',
        age: item.age || '',
        patientType: item.patientType || 'new',
        preferredDate: item.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: item.preferredTime || '10:00 AM - 11:00 AM',
        healthConcern: item.healthConcern || 'General Health Concern',
        symptomsNote: item.symptomsNote || '',
        timestamp: item.timestamp || new Date().toISOString(),
        status: (item.status === 'received' ? 'requested' : item.status) || 'requested',
        internalNotes: Array.isArray(item.internalNotes) ? item.internalNotes : [],
        rescheduledFrom: item.rescheduledFrom,
        source: item.source || 'Website',
        appointmentType: item.appointmentType || 'In-Clinic OPD',
      }));
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  },

  async fetchAppointmentsFromApi(): Promise<AdminAppointment[]> {
    if (typeof window === 'undefined') return this.getAppointments();
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.appointments)) {
          const formatted: AdminAppointment[] = data.appointments.map((item: any) => ({
            bookingReference: item.bookingReference || `NHC-${Math.floor(100000 + Math.random() * 900000)}`,
            fullName: item.fullName || 'Unnamed Patient',
            phone: item.phone || '',
            email: item.email || '',
            age: item.age || '',
            patientType: item.patientType || 'new',
            preferredDate: item.preferredDate || new Date().toISOString().split('T')[0],
            preferredTime: item.preferredTime || '10:00 AM - 11:00 AM',
            healthConcern: item.healthConcern || 'General Health Concern',
            symptomsNote: item.symptomsNote || '',
            timestamp: item.timestamp || new Date().toISOString(),
            status: (item.status === 'received' ? 'requested' : item.status) || 'requested',
            internalNotes: Array.isArray(item.internalNotes) ? item.internalNotes : [],
            rescheduledFrom: item.rescheduledFrom,
            source: item.source || 'Website',
            appointmentType: item.appointmentType || 'In-Clinic OPD',
          }));

          // Save to local cache
          localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(formatted));
          window.dispatchEvent(new CustomEvent('nhc_appointments_updated', { detail: formatted }));
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Could not fetch appointments from /api/appointments:', err);
    }
    return this.getAppointments();
  },

  saveAppointments(appointments: AdminAppointment[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DB_KEYS.APPOINTMENTS, JSON.stringify(appointments));
      window.dispatchEvent(new CustomEvent('nhc_appointments_updated', { detail: appointments }));
    } catch (err) {
      console.error('Failed to save appointments:', err);
    }
  },

  recordPublicAppointment(appt: AdminAppointment): void {
    const list = this.getAppointments();
    const existingIdx = list.findIndex((a) => a.bookingReference === appt.bookingReference);
    if (existingIdx === -1) {
      list.unshift(appt);
      this.saveAppointments(list);
    }

    this.addNotification({
      type: 'new_appointment',
      title: 'New Online Appointment Booking',
      message: `${appt.fullName} booked an appointment for ${appt.preferredDate} (${appt.preferredTime}) - Ref: ${appt.bookingReference}.`,
      targetPath: '/admin/appointments',
      relatedId: appt.bookingReference,
    });
  },

  createAppointment(payload: Partial<AdminAppointment>): AdminAppointment {
    const list = this.getAppointments();
    const bookingReference = payload.bookingReference || `NHC-${Math.floor(100000 + Math.random() * 900000)}`;
    const newAppt: AdminAppointment = {
      bookingReference,
      fullName: payload.fullName?.trim() || 'New Patient',
      phone: payload.phone?.trim() || '',
      email: payload.email?.trim() || '',
      age: payload.age || '',
      patientType: payload.patientType || 'new',
      preferredDate: payload.preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: payload.preferredTime || '10:00 AM - 11:00 AM',
      healthConcern: payload.healthConcern?.trim() || 'General Consultation',
      symptomsNote: payload.symptomsNote || '',
      timestamp: new Date().toISOString(),
      status: payload.status || 'confirmed',
      source: payload.source || 'Admin Entry',
      appointmentType: payload.appointmentType || 'In-Clinic OPD',
      internalNotes: payload.internalNotes || (payload.symptomsNote ? [{
        id: 'note_' + Date.now(),
        author: 'Admin Desk',
        text: payload.symptomsNote,
        createdAt: new Date().toISOString(),
      }] : []),
    };

    list.unshift(newAppt);
    this.saveAppointments(list);

    // Sync to API asynchronously
    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAppt),
    }).catch((err) => console.warn('API sync failed:', err));

    this.addNotification({
      type: 'new_appointment',
      title: 'New Appointment Booked',
      message: `${newAppt.fullName} scheduled for ${newAppt.preferredDate} (${newAppt.preferredTime}) via ${newAppt.source}.`,
      targetPath: '/admin/appointments',
      relatedId: bookingReference,
    });

    auditLogService.log(
      'Manual Appointment Created',
      `Created appointment ${bookingReference} for ${newAppt.fullName} (${newAppt.source})`
    );
    return newAppt;
  },

  updateAppointmentStatus(bookingRef: string, status: AppointmentStatus): AdminAppointment | null {
    const list = this.getAppointments();
    const index = list.findIndex((a) => a.bookingReference === bookingRef);
    if (index === -1) return null;
    const oldStatus = list[index].status;
    list[index].status = status;
    this.saveAppointments(list);

    // Sync to API asynchronously
    fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingReference: bookingRef, status }),
    }).catch((err) => console.warn('API sync failed:', err));

    if (status === 'cancelled') {
      this.addNotification({
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: `Appointment ${bookingRef} (${list[index].fullName}) was marked as cancelled.`,
        targetPath: '/admin/appointments',
        relatedId: bookingRef,
      });
    }

    auditLogService.log(
      'Appointment Status Changed',
      `Appointment ${bookingRef} status changed from "${oldStatus}" to "${status}"`
    );
    return list[index];
  },

  rescheduleAppointment(bookingRef: string, newDate: string, newTime: string): AdminAppointment | null {
    const list = this.getAppointments();
    const index = list.findIndex((a) => a.bookingReference === bookingRef);
    if (index === -1) return null;
    const oldDate = list[index].preferredDate;
    const oldTime = list[index].preferredTime;
    list[index].rescheduledFrom = `${oldDate} (${oldTime})`;
    list[index].preferredDate = newDate;
    list[index].preferredTime = newTime;
    list[index].status = 'confirmed';
    list[index].internalNotes.push({
      id: 'resched_' + Date.now(),
      author: 'Admin Desk',
      text: `Appointment rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}.`,
      createdAt: new Date().toISOString(),
    });
    this.saveAppointments(list);

    // Sync to API asynchronously
    fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingReference: bookingRef, newDate, newTime }),
    }).catch((err) => console.warn('API sync failed:', err));

    auditLogService.log(
      'Appointment Rescheduled',
      `Appointment ${bookingRef} rescheduled to ${newDate} (${newTime})`
    );
    return list[index];
  },

  addAppointmentNote(bookingRef: string, noteText: string, author: string = 'Admin'): AdminAppointment | null {
    const list = this.getAppointments();
    const index = list.findIndex((a) => a.bookingReference === bookingRef);
    if (index === -1) return null;
    const note: InternalAppointmentNote = {
      id: 'note_' + Date.now(),
      author,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    list[index].internalNotes.push(note);
    this.saveAppointments(list);

    // Sync to API asynchronously
    fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingReference: bookingRef, noteText, author }),
    }).catch((err) => console.warn('API sync failed:', err));

    auditLogService.log(
      'Internal Note Added',
      `Internal note recorded on appointment ${bookingRef}`
    );
    return list[index];
  },

  // ==================== ORDERS ====================
  getOrders(): Order[] {
    return getStoredOrders();
  },

  createManualOrder(orderData: {
    customer: { fullName: string; phone: string; email?: string };
    address: { addressLine1: string; city: string; state: string; pincode: string; addressLine2?: string };
    items: { productId: string; quantity: number }[];
    source?: string;
    notes?: string;
    paymentMethod?: 'cod' | 'online_pending' | 'cash' | 'upi';
    discount?: number;
  }): { success: boolean; order?: Order; error?: string } {
    // Stock validation
    const products = this.getProducts();
    const selectedCartItems: any[] = [];
    let subtotal = 0;

    for (const itemReq of orderData.items) {
      const prod = products.find((p) => p.id === itemReq.productId);
      if (!prod) {
        return { success: false, error: `Product ID "${itemReq.productId}" not found.` };
      }
      if (itemReq.quantity <= 0) {
        return { success: false, error: `Invalid quantity for "${prod.name}".` };
      }
      if (prod.stockQuantity < itemReq.quantity) {
        return {
          success: false,
          error: `Insufficient stock for "${prod.name}". Available: ${prod.stockQuantity}, Requested: ${itemReq.quantity}.`,
        };
      }
      subtotal += prod.price * itemReq.quantity;
      selectedCartItems.push({
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        category: prod.category,
        price: prod.price,
        mrp: prod.mrp,
        image: prod.image,
        quantity: itemReq.quantity,
        stockQuantity: prod.stockQuantity,
      });
    }

    // Deduct stock and log inventory change with reason 'Order'
    for (const itemReq of orderData.items) {
      const prod = products.find((p) => p.id === itemReq.productId)!;
      const newStock = Math.max(0, prod.stockQuantity - itemReq.quantity);
      this.updateProductStock(prod.id, newStock, 'Order');
    }

    const settings = this.getSettings();
    const discount = Math.max(0, Number(orderData.discount) || 0);
    const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
    const total = Math.max(0, subtotal - discount + shippingFee);

    const prefix = settings.orderPrefix || 'NHC-ORD-';
    const orderId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      items: selectedCartItems,
      customer: orderData.customer,
      address: orderData.address,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod || 'cod',
      paymentStatus:
        orderData.paymentMethod === 'cash' || orderData.paymentMethod === 'upi'
          ? 'paid'
          : 'pending_on_delivery',
      subtotal,
      shippingFee,
      discount,
      total,
      status: 'confirmed',
      source: orderData.source || 'Admin-created Order',
      estimatedDelivery: '2-4 business days',
    };

    saveOrder(newOrder);

    this.addNotification({
      type: 'new_order',
      title: 'New Order Created',
      message: `Order ${newOrder.id} (₹${newOrder.total}) created for ${newOrder.customer.fullName} via ${newOrder.source}.`,
      targetPath: '/admin/orders',
      relatedId: newOrder.id,
    });

    auditLogService.log(
      'Manual Order Created',
      `Created order ${orderId} for ${newOrder.customer.fullName} (Total: ₹${total})`
    );

    return { success: true, order: newOrder };
  },

  updateOrderStatus(orderId: string, status: OrderStatus, refundAmount?: number): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    const oldStatus = order.status;
    order.status = status;
    if (refundAmount !== undefined) {
      order.refundAmount = refundAmount;
    } else if (status === 'refunded' && !order.refundAmount) {
      order.refundAmount = order.total;
    }
    saveOrder(order);

    if (status === 'cancelled') {
      this.addNotification({
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order ${orderId} (${order.customer.fullName}) was cancelled.`,
        targetPath: '/admin/orders',
        relatedId: orderId,
      });
    } else if (status === 'refunded') {
      this.addNotification({
        type: 'refund_processed',
        title: 'Refund Processed',
        message: `Refund of ₹${order.refundAmount || order.total} recorded for Order ${orderId}.`,
        targetPath: '/admin/orders',
        relatedId: orderId,
      });
    }

    auditLogService.log(
      'Order Status Changed',
      `Order ${orderId} status changed from "${oldStatus}" to "${status}"`
    );
    return order;
  },

  updateOrderPaymentStatus(orderId: string, paymentStatus: 'pending_on_delivery' | 'paid'): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.paymentStatus = paymentStatus;
    saveOrder(order);

    auditLogService.log(
      'Payment Status Changed',
      `Order ${orderId} payment status updated to "${paymentStatus}"`
    );
    return order;
  },

  updateOrderCourier(orderId: string, courierName?: string, trackingNumber?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    (order as any).courierName = courierName || '';
    (order as any).trackingNumber = trackingNumber || '';
    saveOrder(order);

    auditLogService.log(
      'Order Courier Updated',
      `Order ${orderId} courier info updated: ${courierName || 'Courier'} - AWB: ${trackingNumber || 'N/A'}`
    );
    return order;
  },

  // ==================== PRODUCTS & INVENTORY ====================
  getProducts(): ProductItem[] {
    if (typeof window === 'undefined') return PRODUCTS_DATA;
    try {
      const raw = localStorage.getItem(DB_KEYS.PRODUCTS);
      if (!raw) {
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(PRODUCTS_DATA));
        return PRODUCTS_DATA;
      }
      return JSON.parse(raw);
    } catch {
      return PRODUCTS_DATA;
    }
  },

  async fetchProductsFromApi(): Promise<ProductItem[]> {
    if (typeof window === 'undefined') return this.getProducts();
    try {
      const res = await fetch('/api/products', {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(data.products));
          window.dispatchEvent(new CustomEvent('nhc_products_updated', { detail: data.products }));
          return data.products;
        }
      }
    } catch (err) {
      console.warn('Could not fetch products from /api/products:', err);
    }
    return this.getProducts();
  },

  saveProducts(products: ProductItem[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent('nhc_products_updated', { detail: products }));
    } catch (err) {
      console.error('Failed to save products:', err);
    }
  },

  saveOrUpdateProduct(product: ProductItem): ProductItem {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    const isNew = index === -1;
    const threshold = this.getSettings().lowStockThreshold || 10;
    const stockStatus = getProductStockStatus(product.stockQuantity, threshold);
    const nowIso = new Date().toISOString();

    const normalizedProduct: ProductItem = {
      ...product,
      stockStatus,
      updatedAt: nowIso,
      createdAt: product.createdAt || nowIso,
    };

    if (isNew) {
      products.unshift(normalizedProduct);
      auditLogService.log('Product Created', `Added product "${normalizedProduct.name}" (SKU: ${normalizedProduct.sku})`);
      fetch('/api/products', {
        method: 'POST',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(normalizedProduct),
      }).catch((err) => console.warn('API sync failed for product creation:', err));
    } else {
      products[index] = normalizedProduct;
      auditLogService.log('Product Edited', `Updated product "${normalizedProduct.name}" (SKU: ${normalizedProduct.sku})`);
      fetch(`/api/products/${normalizedProduct.id}`, {
        method: 'PUT',
        headers: getAdminAuthHeaders(),
        body: JSON.stringify(normalizedProduct),
      }).catch((err) => console.warn('API sync failed for product update:', err));
    }

    this.saveProducts(products);
    return normalizedProduct;
  },

  adjustStock(
    productId: string,
    newStock: number,
    changeReason: InventoryChangeReason = 'Manual Adjustment',
    note?: string,
    adminAccount: string = 'navin@navinhomeocare.com'
  ): ProductItem | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const prod = products[index];
    const prevStock = prod.stockQuantity;
    const clamped = Math.max(0, newStock);
    const threshold = this.getSettings().lowStockThreshold || 10;
    const stockStatus = getProductStockStatus(clamped, threshold);

    prod.stockQuantity = clamped;
    prod.stockStatus = stockStatus;
    prod.updatedAt = new Date().toISOString();
    products[index] = prod;
    this.saveProducts(products);

    const changeAmount = clamped - prevStock;
    this.logInventoryChange(
      productId,
      prod.name,
      prevStock,
      clamped,
      changeAmount,
      changeReason,
      note,
      adminAccount
    );

    // Sync to API
    fetch('/api/products/stock', {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({
        productId,
        newStock: clamped,
        changeReason,
        note,
        adminAccount,
      }),
    }).catch((err) => console.warn('API stock sync failed:', err));

    // Notifications
    if (clamped === 0) {
      this.addNotification({
        type: 'out_of_stock',
        title: 'Product Out of Stock',
        message: `${prod.name} is now out of stock (0 units remaining).`,
        targetPath: '/admin/products',
        relatedId: productId,
      });
    } else if (clamped <= threshold && prevStock > threshold) {
      this.addNotification({
        type: 'low_stock',
        title: 'Low Stock Alert',
        message: `${prod.name} has fallen below safety threshold (${clamped} units left; threshold: ${threshold}).`,
        targetPath: '/admin/products',
        relatedId: productId,
      });
    }

    auditLogService.log(
      'Stock Adjusted',
      `Product "${prod.name}" stock changed from ${prevStock} to ${clamped} (${changeReason}${note ? ' - ' + note : ''})`
    );

    return prod;
  },

  updateProductStock(
    productId: string,
    newStock: number,
    reason: InventoryChangeReason = 'Manual Adjustment'
  ): ProductItem | null {
    return this.adjustStock(productId, newStock, reason);
  },

  toggleProductStatus(productId: string, field: 'active' | 'showOnShop' | 'featured'): ProductItem | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const prod = products[index];
    const currentVal = !!(prod as any)[field];
    (prod as any)[field] = !currentVal;
    prod.updatedAt = new Date().toISOString();
    products[index] = prod;
    this.saveProducts(products);

    fetch(`/api/products/${prod.id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ [field]: prod[field] }),
    }).catch((err) => console.warn('API sync failed for toggle:', err));

    auditLogService.log('Product Status Toggled', `Toggled ${field} to ${prod[field]} for "${prod.name}"`);
    return prod;
  },

  archiveProduct(productId: string, archived = true): ProductItem | null {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === productId);
    if (index === -1) return null;

    const prod = products[index];
    prod.archived = archived;
    prod.updatedAt = new Date().toISOString();
    products[index] = prod;
    this.saveProducts(products);

    fetch(`/api/products/${prod.id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ archived }),
    }).catch((err) => console.warn('API sync failed for archive:', err));

    auditLogService.log(
      archived ? 'Product Archived' : 'Product Restored',
      `Product "${prod.name}" was ${archived ? 'archived' : 'restored from archive'}`
    );
    return prod;
  },

  duplicateProduct(productId: string): ProductItem | null {
    const products = this.getProducts();
    const orig = products.find((p) => p.id === productId);
    if (!orig) return null;

    const newId = `prod-${Date.now()}`;
    const newSku = `NHC-SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const newName = `${orig.name} (Copy)`;
    const newSlug = `${orig.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;

    const copy: ProductItem = {
      ...orig,
      id: newId,
      sku: newSku,
      name: newName,
      slug: newSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.saveOrUpdateProduct(copy);
  },

  deleteProduct(productId: string): { success: boolean; error?: string } {
    const orders = this.getOrders();
    const isReferencedInOrders = orders.some(
      (o) => o.status !== 'cancelled' && o.items.some((item) => item.id === productId)
    );

    if (isReferencedInOrders) {
      return {
        success: false,
        error:
          'This product has existing order records and cannot be permanently deleted. You can Archive or Deactivate it instead to preserve sales audit history.',
      };
    }

    const products = this.getProducts();
    const target = products.find((p) => p.id === productId);
    const filtered = products.filter((p) => p.id !== productId);
    if (filtered.length === products.length) {
      return { success: false, error: 'Product not found.' };
    }

    this.saveProducts(filtered);

    fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    }).catch((err) => console.warn('API delete sync failed:', err));

    auditLogService.log(
      'Product Deleted',
      `Permanently deleted product "${target?.name || productId}"`
    );
    return { success: true };
  },

  getInventoryLogs(): InventoryLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_INVENTORY_LOGS;
    try {
      const raw = localStorage.getItem(DB_KEYS.INVENTORY_LOGS);
      if (!raw) {
        localStorage.setItem(DB_KEYS.INVENTORY_LOGS, JSON.stringify(INITIAL_INVENTORY_LOGS));
        return INITIAL_INVENTORY_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_INVENTORY_LOGS;
    }
  },

  async fetchInventoryLogsFromApi(): Promise<InventoryLogEntry[]> {
    if (typeof window === 'undefined') return this.getInventoryLogs();
    try {
      const res = await fetch('/api/inventory-logs', {
        headers: getAdminAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
          localStorage.setItem(DB_KEYS.INVENTORY_LOGS, JSON.stringify(data.logs));
          return data.logs;
        }
      }
    } catch (err) {
      console.warn('Could not fetch inventory logs from /api/inventory-logs:', err);
    }
    return this.getInventoryLogs();
  },

  logInventoryChange(
    productId: string,
    productName: string,
    previousStock: number,
    newStock: number,
    changeAmount: number,
    changeReason: InventoryChangeReason,
    note?: string,
    adminAccount: string = 'navin@navinhomeocare.com'
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const logs = this.getInventoryLogs();
      const newEntry: InventoryLogEntry = {
        id: 'inv_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        productId,
        productName,
        previousStock,
        newStock,
        changeAmount,
        changeReason,
        note: note || '',
        timestamp: new Date().toISOString(),
        adminAccount,
      };
      logs.unshift(newEntry);
      localStorage.setItem(DB_KEYS.INVENTORY_LOGS, JSON.stringify(logs.slice(0, 200)));
    } catch {
      // ignore
    }
  },

  // ==================== NOTIFICATION CENTER ====================
  getNotifications(): AdminNotification[] {
    if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
    try {
      const raw = localStorage.getItem(DB_KEYS.NOTIFICATIONS);
      if (!raw) {
        localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: AdminNotification[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DB_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (err) {
      console.error('Failed to save notifications:', err);
    }
  },

  addNotification(item: Omit<AdminNotification, 'id' | 'timestamp' | 'read'>): AdminNotification {
    const notifs = this.getNotifications();
    const newNotif: AdminNotification = {
      ...item,
      id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newNotif);
    this.saveNotifications(notifs.slice(0, 50));
    return newNotif;
  },

  markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    if (target) {
      target.read = true;
      this.saveNotifications(notifs);
    }
  },

  markAllNotificationsRead(): void {
    const notifs = this.getNotifications();
    notifs.forEach((n) => (n.read = true));
    this.saveNotifications(notifs);
  },

  deleteNotification(id: string): void {
    const notifs = this.getNotifications();
    const filtered = notifs.filter((n) => n.id !== id);
    this.saveNotifications(filtered);
  },

  getUnreadNotificationCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  },

  // ==================== SECTION 4: PATIENT PRIVACY & CUSTOMER SEPARATION ====================
  getCustomers(): CustomerSummary[] {
    const appointments = this.getAppointments();
    const orders = this.getOrders();
    const customerMap = new Map<string, CustomerSummary>();

    // Process from appointments
    for (const appt of appointments) {
      const phoneKey = appt.phone.replace(/\D/g, '').slice(-10);
      if (!phoneKey) continue;

      if (!customerMap.has(phoneKey)) {
        customerMap.set(phoneKey, {
          id: `CUST-${phoneKey}`,
          fullName: appt.fullName,
          phone: appt.phone,
          email: appt.email,
          totalAppointments: 0,
          totalOrders: 0,
          totalPurchaseValue: 0,
          lastAppointmentDate: appt.preferredDate,
          orders: [],
          appointments: [],
        });
      }

      const cust = customerMap.get(phoneKey)!;
      cust.totalAppointments += 1;

      // PRIVACY SAFEGUARD: Store ONLY date, time, reference and status.
      // NEVER include healthConcern, symptomsNote, diagnosis, or internal notes in customer screens!
      cust.appointments.push({
        bookingReference: appt.bookingReference,
        preferredDate: appt.preferredDate,
        preferredTime: appt.preferredTime,
        status: appt.status,
      });

      if (!cust.lastAppointmentDate || appt.preferredDate > cust.lastAppointmentDate) {
        cust.lastAppointmentDate = appt.preferredDate;
      }
    }

    // Process from orders
    for (const order of orders) {
      const phoneKey = order.customer.phone.replace(/\D/g, '').slice(-10);
      if (!phoneKey) continue;

      if (!customerMap.has(phoneKey)) {
        customerMap.set(phoneKey, {
          id: `CUST-${phoneKey}`,
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          email: order.customer.email,
          totalAppointments: 0,
          totalOrders: 0,
          totalPurchaseValue: 0,
          orders: [],
          appointments: [],
        });
      }

      const cust = customerMap.get(phoneKey)!;
      cust.totalOrders += 1;
      cust.totalPurchaseValue += order.total;

      const orderDateStr = order.createdAt.split('T')[0];
      if (!cust.lastOrderDate || orderDateStr > cust.lastOrderDate) {
        cust.lastOrderDate = orderDateStr;
      }

      cust.orders.push({
        id: order.id,
        createdAt: order.createdAt,
        total: order.total,
        status: order.status,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      });
    }

    const result = Array.from(customerMap.values()).sort((a, b) => {
      const aDate = a.lastOrderDate || a.lastAppointmentDate || '';
      const bDate = b.lastOrderDate || b.lastAppointmentDate || '';
      return bDate.localeCompare(aDate);
    });

    // Save to customers DB table
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(result));
      } catch {
        // ignore
      }
    }

    return result;
  },

  // ==================== ENQUIRIES ====================
  getEnquiries(): AdminEnquiry[] {
    if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
    try {
      const raw = localStorage.getItem(DB_KEYS.ENQUIRIES);
      if (!raw) {
        localStorage.setItem(DB_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
        return INITIAL_ENQUIRIES;
      }
      const data = JSON.parse(raw);
      return data.map((item: any, i: number) => ({
        id: item.id || `ENQ-${100 + i}`,
        name: item.name || 'Anonymous Patient',
        phone: item.phone || '',
        concern: item.concern || 'Consultation Enquiry',
        message: item.message || '',
        timestamp: item.timestamp || new Date().toISOString(),
        status: item.status || 'new',
        adminResponse: item.adminResponse || '',
      }));
    } catch {
      return INITIAL_ENQUIRIES;
    }
  },

  updateEnquiryStatus(enquiryId: string, status: EnquiryStatus, adminResponse?: string): AdminEnquiry | null {
    const list = this.getEnquiries();
    const index = list.findIndex((e) => e.id === enquiryId);
    if (index === -1) return null;
    list[index].status = status;
    if (adminResponse !== undefined) {
      list[index].adminResponse = adminResponse;
    }
    localStorage.setItem(DB_KEYS.ENQUIRIES, JSON.stringify(list));

    auditLogService.log('Enquiry Status Changed', `Enquiry ${enquiryId} marked as "${status}"`);
    return list[index];
  },

  // ==================== REVIEWS ====================
  getReviews(): AdminReview[] {
    if (typeof window === 'undefined') {
      return REVIEWS_DATA.map((r) => ({ ...r, status: 'published' as const }));
    }
    try {
      const raw = localStorage.getItem(DB_KEYS.SETTINGS + '_reviews');
      if (!raw) {
        const seeded: AdminReview[] = REVIEWS_DATA.map((r) => ({
          ...r,
          status: 'published' as const,
        }));
        localStorage.setItem(DB_KEYS.SETTINGS + '_reviews', JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return REVIEWS_DATA.map((r) => ({ ...r, status: 'published' as const }));
    }
  },

  updateReviewStatus(reviewId: string, status: 'published' | 'pending' | 'hidden'): AdminReview | null {
    const list = this.getReviews();
    const index = list.findIndex((r) => r.id === reviewId);
    if (index === -1) return null;
    list[index].status = status;
    localStorage.setItem(DB_KEYS.SETTINGS + '_reviews', JSON.stringify(list));

    auditLogService.log('Review Status Changed', `Review ${reviewId} marked as "${status}"`);
    return list[index];
  },

  saveOrAddReview(review: AdminReview): AdminReview {
    const list = this.getReviews();
    const index = list.findIndex((r) => r.id === review.id);
    if (index >= 0) {
      list[index] = review;
    } else {
      list.unshift(review);
    }
    localStorage.setItem(DB_KEYS.SETTINGS + '_reviews', JSON.stringify(list));
    auditLogService.log('Review Saved', `Review for ${review.author} updated`);
    return review;
  },

  deleteReview(reviewId: string): boolean {
    const list = this.getReviews();
    const filtered = list.filter((r) => r.id !== reviewId);
    if (filtered.length === list.length) return false;
    localStorage.setItem(DB_KEYS.SETTINGS + '_reviews', JSON.stringify(filtered));
    auditLogService.log('Review Deleted', `Review ${reviewId} deleted`);
    return true;
  },

  // ==================== SECTION 11: SETTINGS ====================
  getSettings(): ClinicSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(DB_KEYS.SETTINGS);
      if (!raw) {
        localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: ClinicSettings): ClinicSettings {
    if (typeof window === 'undefined') return settings;
    try {
      localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
      auditLogService.log('Settings Changed', 'Clinic and shop settings updated');
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    return settings;
  },

    // ==================== SECTION 3: REVENUE CALCULATIONS & ADVANCED ANALYTICS ====================
  // Revenue must NEVER be calculated from cancelled orders.
  // Gross Sales, Discounts, Shipping, Refunds, and Net Revenue clearly separated.
  getRevenueBreakdown(ordersList?: Order[], filter?: string, customStart?: string, customEnd?: string) {
    const allOrders = ordersList || this.getOrders();
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Helper date filtering
    let filteredOrders = allOrders;
    if (filter) {
      if (filter === 'today') {
        filteredOrders = allOrders.filter((o) => o.createdAt.startsWith(todayStr));
      } else if (filter === 'yesterday') {
        const yDate = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
        filteredOrders = allOrders.filter((o) => o.createdAt.startsWith(yDate));
      } else if (filter === '7d' || filter === 'last_7_days') {
        const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
        filteredOrders = allOrders.filter((o) => o.createdAt.split('T')[0] >= d7);
      } else if (filter === '30d' || filter === 'last_30_days') {
        const d30 = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
        filteredOrders = allOrders.filter((o) => o.createdAt.split('T')[0] >= d30);
      } else if (filter === 'this_month') {
        const monthPrefix = todayStr.substring(0, 7);
        filteredOrders = allOrders.filter((o) => o.createdAt.startsWith(monthPrefix));
      } else if (filter === 'last_month') {
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthPrefix = prevMonthDate.toISOString().substring(0, 7);
        filteredOrders = allOrders.filter((o) => o.createdAt.startsWith(prevMonthPrefix));
      } else if (filter === 'custom' && customStart && customEnd) {
        filteredOrders = allOrders.filter((o) => {
          const d = o.createdAt.split('T')[0];
          return d >= customStart && d <= customEnd;
        });
      }
    }

    // CRITICAL: Exclude cancelled orders completely
    const nonCancelledOrders = filteredOrders.filter((o) => o.status !== 'cancelled');

    let grossSales = 0;
    let discounts = 0;
    let shipping = 0;
    let refunds = 0;

    nonCancelledOrders.forEach((o) => {
      const itemSubtotal = o.subtotal || o.items.reduce((s, it) => s + it.price * it.quantity, 0);
      grossSales += itemSubtotal;
      discounts += o.discount || 0;
      shipping += o.shippingFee || 0;

      if (o.status === 'refunded') {
        refunds += o.refundAmount || o.total;
      } else if (o.refundAmount && o.refundAmount > 0) {
        refunds += o.refundAmount;
      }
    });

    // Net Revenue = Gross Sales - Discounts + Shipping - Refunds
    const netRevenue = Math.max(0, grossSales - discounts + shipping - refunds);

    // Lifetime time-based metrics (excluding cancelled)
    const allNonCancelled = allOrders.filter((o) => o.status !== 'cancelled');
    const weekStartStr = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const monthStartStr = todayStr.substring(0, 7);

    const calcNet = (ords: Order[]) => {
      return ords.reduce((sum, o) => {
        const ref = o.status === 'refunded' ? o.refundAmount || o.total : o.refundAmount || 0;
        const gross = o.subtotal || o.items.reduce((s, it) => s + it.price * it.quantity, 0);
        const orderNet = Math.max(0, gross - (o.discount || 0) + (o.shippingFee || 0) - ref);
        return sum + orderNet;
      }, 0);
    };

    const todayRevenue = calcNet(allNonCancelled.filter((o) => o.createdAt.startsWith(todayStr)));
    const weeklyRevenue = calcNet(allNonCancelled.filter((o) => o.createdAt.split('T')[0] >= weekStartStr));
    const monthlyRevenue = calcNet(allNonCancelled.filter((o) => o.createdAt.startsWith(monthStartStr)));
    const lifetimeNetRevenue = calcNet(allNonCancelled);

    return {
      grossSales,
      discounts,
      shipping,
      refunds,
      netRevenue,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
      lifetimeNetRevenue,
      validOrderCount: nonCancelledOrders.length,
      cancelledOrderCount: filteredOrders.filter((o) => o.status === 'cancelled').length,
      refundedOrderCount: filteredOrders.filter((o) => o.status === 'refunded').length,
    };
  },

  // ==================== SECTION 4: CUSTOMER ANALYTICS ====================
  // Shows customer engagement while strictly safeguarding patient health details
  getCustomerAnalytics(filter?: string, customStart?: string, customEnd?: string) {
    const customers = this.getCustomers();
    const allOrders = this.getOrders().filter((o) => o.status !== 'cancelled');

    const totalCustomers = customers.length;
    // Repeat buyers: placed >= 2 orders
    const repeatBuyers = customers.filter((c) => c.totalOrders >= 2).length;
    // Returning customers: > 1 appointment or order
    const returningCustomers = customers.filter((c) => c.totalOrders + c.totalAppointments > 1).length;
    // New customers: 1 appointment or order
    const newCustomers = customers.filter((c) => c.totalOrders + c.totalAppointments <= 1).length;

    const totalOrdersCount = allOrders.length;
    const revBreakdown = this.getRevenueBreakdown(allOrders);
    const totalNetRevenue = revBreakdown.netRevenue;

    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalNetRevenue / totalOrdersCount) : 0;
    const ordersPerCustomer = totalCustomers > 0 ? Number((totalOrdersCount / totalCustomers).toFixed(1)) : 0;

    return {
      totalCustomers,
      newCustomers,
      returningCustomers,
      repeatBuyers,
      averageOrderValue,
      ordersPerCustomer,
    };
  },

  // ==================== SECTION 6: EXACT MAIN DASHBOARD KPIS ====================
  getDashboardKPIs() {
    const appointments = this.getAppointments();
    const orders = this.getOrders();
    const products = this.getProducts();
    const customers = this.getCustomers();

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7); // YYYY-MM

    // Appointments Today
    const appointmentsToday = appointments.filter((a) => a.preferredDate === todayStr).length;

    // Pending Appointments (status === 'requested')
    const pendingAppointments = appointments.filter((a) => a.status === 'requested').length;

    // Appointments This Month
    const appointmentsThisMonth = appointments.filter((a) => a.preferredDate.startsWith(currentMonthPrefix)).length;

    // Total Appointments
    const totalAppointments = appointments.length;

    // Orders Today
    const ordersToday = orders.filter((o) => o.createdAt.startsWith(todayStr)).length;

    // Orders This Month
    const ordersThisMonth = orders.filter((o) => o.createdAt.startsWith(currentMonthPrefix)).length;

    // Total Orders
    const totalOrders = orders.length;

    // Revenue calculations via getRevenueBreakdown (strictly excludes cancelled orders & handles refunds)
    const rev = this.getRevenueBreakdown(orders);

    // Products Sold (from non-cancelled orders)
    const validOrders = orders.filter((o) => o.status !== 'cancelled' && (o.status as any) !== 'refunded');
    const productsSold = validOrders.reduce(
      (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    // Product Inventory KPIs
    const lowStockThreshold = this.getSettings().lowStockThreshold || 10;
    const activeProducts = products.filter((p) => p.archived !== true);
    const lowStockProducts = activeProducts.filter(
      (p) => p.stockQuantity <= lowStockThreshold && p.stockQuantity > 0
    ).length;
    const outOfStockProducts = activeProducts.filter((p) => p.stockQuantity === 0).length;
    const expiringSoonProducts = activeProducts.filter(
      (p) => p.expiryDate && isProductExpiringSoon(p.expiryDate, 90) && !isProductExpired(p.expiryDate)
    ).length;
    const expiredProducts = activeProducts.filter((p) => isProductExpired(p.expiryDate)).length;
    const totalStockUnits = activeProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalInventoryValuation = activeProducts.reduce(
      (sum, p) => sum + (p.costPrice || p.price) * p.stockQuantity,
      0
    );

    return {
      appointmentsToday,
      pendingAppointments,
      appointmentsThisMonth,
      totalAppointments,
      ordersToday,
      ordersThisMonth,
      totalOrders,
      todayRevenue: rev.todayRevenue,
      monthlyRevenue: rev.monthlyRevenue,
      lifetimeStoreRevenue: rev.lifetimeNetRevenue,
      productsSold,
      lowStockProducts,
      outOfStockProducts,
      expiringSoonProducts,
      expiredProducts,
      totalStockUnits,
      totalInventoryValuation,
      totalCustomers: customers.length,
      revenueBreakdown: rev,
    };
  },
};
