/**
 * The Spring Boot / Oracle backend is the source of truth for field naming.
 * Rows are kept as raw records and read through case-insensitive accessors
 * (see utils/fields.ts). The interfaces below are *view models* only — they
 * never replace the backend payload, which is always kept on `raw`.
 */

export type Row = Record<string, unknown>;

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dob: string;
  gender: string;
  city: string;
  area: string;
  pincode: string;
  raw: Row;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dob: string;
  dateJoined: string;
  licenseNumber: string;
  experience: string;
  specialization: string;
  rating: string;
  raw: Row;
}

export interface Hospital {
  id: string;
  name: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  raw: Row;
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  bookingDate: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  mode: string;
  videoLink: string;
  callNumber: string;
  chatTranscriptId: string;
  raw: Row;
}

export interface Prescription {
  id: string;
  consultationId: string;
  prescriptionDate: string;
  dosage: string;
  raw: Row;
}

export interface Medicine {
  id: string;
  name: string;
  type: string;
  raw: Row;
}

export interface MedicalTest {
  id: string;
  name: string;
  type: string;
  raw: Row;
}

export interface Payment {
  id: string;
  consultationId: string;
  amount: number | undefined;
  paidBy: string;
  raw: Row;
}

/** Generic label/value pair used by every dashboard aggregate endpoint. */
export interface Aggregate {
  label: string;
  count: number;
  amount?: number;
}

export const SPECIALIZATIONS = [
'GENERAL_PHYSICIAN',
'CARDIOLOGIST',
'NEUROLOGIST',
'DERMATOLOGIST',
'PSYCHIATRIST'] as
const;

export const CONSULTATION_MODES = ['VIDEO', 'AUDIO', 'CHAT'] as const;

export const MEDICINE_TYPES = ['DRUG', 'INJECTION', 'TABLET', 'SYRUP'] as const;

export const TEST_TYPES = ['BLOOD_TEST', 'X_RAY', 'URINE_TEST', 'ECG'] as const;

export const PAYMENT_METHODS = ['COD', 'UPI', 'CARD', 'NETBANKING'] as const;

/** Oracle stores the canonical gender codes; UI labels are supplied separately. */
export const GENDERS = ['M', 'F', 'O'] as const;
export const GENDER_LABELS: Record<(typeof GENDERS)[number], string> = { M: 'Male', F: 'Female', O: 'Other' };
