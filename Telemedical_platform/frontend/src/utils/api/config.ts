/**
 * ────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for every backend address the frontend touches.
 *
 * Paths below are relative to the Spring Boot API base and have been matched
 * to the controller mappings in ../backend.
 * ────────────────────────────────────────────────────────────────────────────
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const id = (value: string | number) => encodeURIComponent(String(value));

export const endpoints = {
  dashboard: {
    summary: '/dashboard/summary',
    consultationsByStatus: '/dashboard/consultations-by-status',
    patientsByCity: '/dashboard/patients-by-city',
    doctorsBySpecialization: '/dashboard/doctors-by-specialization',
    paymentSummary: '/dashboard/payment-summary'
  },
  patients: {
    base: '/patients',
    one: (key: string | number) => `/patients/${id(key)}`,
    phones: (key: string | number) => `/patient-phones/patient/${id(key)}`,
    medicalRecords: (key: string | number) => `/medical-records/patient/${id(key)}`,
    feedback: (key: string | number) => `/feedback/patient/${id(key)}`
  },
  doctors: {
    base: '/doctors',
    one: (key: string | number) => `/doctors/${id(key)}`,
    phones: (key: string | number) => `/doctor-phones/doctor/${id(key)}`,
    qualifications: (key: string | number) => `/doctor-qualifications/doctor/${id(key)}`,
    ratings: (key: string | number) => `/doctor-ratings/doctor/${id(key)}`,
    specializations: (key: string | number) => `/doctor-specializations/doctor/${id(key)}`,
    hospitals: (key: string | number) => `/hospital-doctors/doctor/${id(key)}`,
    specializationsBase: '/doctor-specializations'
  },
  hospitals: {
    base: '/hospitals',
    one: (key: string | number) => `/hospitals/${id(key)}`,
    phones: (key: string | number) => `/hospital-phones/hospital/${id(key)}`,
    doctors: (key: string | number) => `/hospital-doctors/hospital/${id(key)}`
  },
  consultations: {
    base: '/consultations',
    one: (key: string | number) => `/consultations/${id(key)}`
  },
  prescriptions: {
    base: '/prescriptions',
    one: (key: string | number) => `/prescriptions/${id(key)}`,
    medicines: (key: string | number) => `/prescription-medicines/prescription/${id(key)}`,
    tests: (key: string | number) => `/prescription-tests/prescription/${id(key)}`
  },
  medicines: {
    base: '/medicines',
    one: (key: string | number) => `/medicines/${id(key)}`
  },
  tests: {
    base: '/tests',
    one: (key: string | number) => `/tests/${id(key)}`
  },
  payments: {
    base: '/payments',
    one: (key: string | number) => `/payments/${id(key)}`
  }
} as const;
