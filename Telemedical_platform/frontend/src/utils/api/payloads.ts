import type { FormValues } from '../../components/ui/EntityForm';
import type { Row } from '../../types/entities';

const number = (value: string | number): number => Number(value);

export const payloads = {
  patient: (
    v: FormValues | Record<string, any>,
    extras?: {
      phones?: string[];
      medicalRecords?: Array<{ medicalRecordId?: string | number; symptoms: string; diagnoses: string }>;
      feedbacks?: Array<{ feedbackId?: string | number; feedbackComment: string; rating: number }>;
    }
  ): Row => ({
    firstName: v.firstName,
    lastName: v.lastName,
    dob: v.dob,
    gender: v.gender,
    city: v.city,
    area: v.area || null,
    pincode: v.pincode || null,
    ...(extras?.phones !== undefined ? { phones: extras.phones } : {}),
    ...(extras?.medicalRecords !== undefined ? { medicalRecords: extras.medicalRecords } : {}),
    ...(extras?.feedbacks !== undefined ? { feedbacks: extras.feedbacks } : {})
  }),

  doctor: (
    v: FormValues | Record<string, any>,
    extras?: {
      phones?: string[];
      qualifications?: string[];
      specialization?: string;
      rating?: number | null;
      hospitals?: Array<{ hospitalId: string | number; role?: string }>;
    }
  ): Row => ({
    firstName: v.firstName,
    lastName: v.lastName,
    dob: v.dob,
    gender: v.gender,
    dateJoined: v.dateJoined || null,
    licenseNumber: v.licenseNumber,
    experience: v.experience !== undefined && v.experience !== null && v.experience !== '' ? number(v.experience) : null,
    ...(extras?.phones !== undefined ? { phones: extras.phones } : {}),
    ...(extras?.qualifications !== undefined ? { qualifications: extras.qualifications } : {}),
    ...(extras?.specialization !== undefined ? { specialization: extras.specialization } : {}),
    ...(extras?.rating !== undefined ? { rating: extras.rating } : {}),
    ...(extras?.hospitals !== undefined
      ? {
          hospitals: extras.hospitals.map((h) => ({
            hospitalId: number(h.hospitalId),
            role: h.role || null
          }))
        }
      : {})
  }),

  hospital: (
    v: FormValues | Record<string, any>,
    extras?: {
      phones?: string[];
      doctors?: Array<{ doctorId: string | number; role?: string }>;
    }
  ): Row => ({
    hospitalName: v.hospitalName,
    street: v.street || null,
    area: v.area || null,
    city: v.city,
    pincode: v.pincode || null,
    ...(extras?.phones !== undefined ? { phones: extras.phones } : {}),
    ...(extras?.doctors !== undefined
      ? {
          doctors: extras.doctors.map((d) => ({
            doctorId: number(d.doctorId),
            role: d.role || null
          }))
        }
      : {})
  }),

  consultation: (v: FormValues | Record<string, any>): Row => ({
    patientId: number(v.patientId),
    doctorId: number(v.doctorId),
    bookingDate: v.bookingDate || null,
    date: v.date,
    startTime: v.startTime || null,
    endTime: v.endTime || null,
    status: v.status || null,
    consultationMode: v.consultationMode,
    videoLink: v.videoLink || null,
    callNumber: v.callNumber || null,
    chatTranscriptId: v.chatTranscriptId || null
  }),

  prescription: (
    v: FormValues | Record<string, any>,
    extras?: {
      medicineIds?: number[];
      testIds?: number[];
    }
  ): Row => ({
    consultationId: number(v.consultationId),
    prescriptionDate: v.prescriptionDate,
    dosage: v.dosage || null,
    ...(extras?.medicineIds !== undefined ? { medicineIds: extras.medicineIds } : {}),
    ...(extras?.testIds !== undefined ? { testIds: extras.testIds } : {})
  }),

  medicine: (v: FormValues | Record<string, any>): Row => ({
    medicineName: v.medicineName,
    medicineType: v.medicineType
  }),

  test: (v: FormValues | Record<string, any>): Row => ({
    testName: v.testName,
    testType: v.testType
  }),

  payment: (v: FormValues | Record<string, any>): Row => ({
    consultationId: number(v.consultationId),
    amount: number(v.amount),
    paidBy: v.paidBy
  })
};
