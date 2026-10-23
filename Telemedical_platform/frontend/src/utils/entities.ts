import type {
  Aggregate,
  Consultation,
  Doctor,
  Hospital,
  MedicalTest,
  Medicine,
  Patient,
  Payment,
  Prescription,
  Row } from
'../types/entities';
import { pickNumber, pickString } from './fields';

const joinName = (first: string, last: string, fallback: string): string => {
  const name = `${first} ${last}`.trim();
  return name || fallback;
};

export const patientKeys = {
  id: ['patientId', 'patient_id', 'id'],
  firstName: ['firstName', 'first_name', 'patientFirstName'],
  lastName: ['lastName', 'last_name', 'patientLastName'],
  dob: ['dob', 'dateOfBirth', 'date_of_birth', 'birthDate'],
  gender: ['gender', 'sex'],
  city: ['city'],
  area: ['area'],
  pincode: ['pincode', 'pinCode', 'zip', 'postalCode']
};

export function toPatient(row: Row): Patient {
  const id = pickString(row, patientKeys.id);
  const firstName = pickString(row, patientKeys.firstName);
  const lastName = pickString(row, patientKeys.lastName);
  return {
    id,
    firstName,
    lastName,
    fullName: joinName(firstName, lastName, id ? `Patient ${id}` : 'Unnamed patient'),
    dob: pickString(row, patientKeys.dob),
    gender: pickString(row, patientKeys.gender),
    city: pickString(row, patientKeys.city),
    area: pickString(row, patientKeys.area),
    pincode: pickString(row, patientKeys.pincode),
    raw: row
  };
}

export const doctorKeys = {
  id: ['doctorId', 'doctor_id', 'id'],
  firstName: ['firstName', 'first_name', 'doctorFirstName'],
  lastName: ['lastName', 'last_name', 'doctorLastName'],
  gender: ['gender', 'sex'],
  dob: ['dob', 'dateOfBirth', 'date_of_birth'],
  dateJoined: ['dateJoined', 'date_joined', 'joiningDate', 'joinDate'],
  licenseNumber: ['licenseNumber', 'license_number', 'licenseNo'],
  experience: ['experience', 'experienceYears', 'yearsOfExperience'],
  specialization: ['specialization', 'specialisation', 'doctorSpecialization', 'specializationType'],
  rating: ['rating', 'doctorRating', 'avgRating', 'averageRating']
};

export function toDoctor(row: Row): Doctor {
  const id = pickString(row, doctorKeys.id);
  const firstName = pickString(row, doctorKeys.firstName);
  const lastName = pickString(row, doctorKeys.lastName);
  return {
    id,
    firstName,
    lastName,
    fullName: joinName(firstName, lastName, id ? `Doctor ${id}` : 'Unnamed doctor'),
    gender: pickString(row, doctorKeys.gender),
    dob: pickString(row, doctorKeys.dob),
    dateJoined: pickString(row, doctorKeys.dateJoined),
    licenseNumber: pickString(row, doctorKeys.licenseNumber),
    experience: pickString(row, doctorKeys.experience),
    specialization: pickString(row, doctorKeys.specialization),
    rating: pickString(row, doctorKeys.rating),
    raw: row
  };
}

export const hospitalKeys = {
  id: ['hospitalId', 'hospital_id', 'id'],
  name: ['hospitalName', 'hospital_name', 'name'],
  street: ['street'],
  area: ['area'],
  city: ['city'],
  pincode: ['pincode', 'pinCode', 'zip']
};

export function toHospital(row: Row): Hospital {
  const id = pickString(row, hospitalKeys.id);
  return {
    id,
    name: pickString(row, hospitalKeys.name, id ? `Hospital ${id}` : 'Unnamed hospital'),
    street: pickString(row, hospitalKeys.street),
    area: pickString(row, hospitalKeys.area),
    city: pickString(row, hospitalKeys.city),
    pincode: pickString(row, hospitalKeys.pincode),
    raw: row
  };
}

export const consultationKeys = {
  id: ['consultationId', 'consultation_id', 'id'],
  patientId: ['patientId', 'patient_id'],
  doctorId: ['doctorId', 'doctor_id'],
  patientName: ['patientName', 'patient_name'],
  doctorName: ['doctorName', 'doctor_name'],
  bookingDate: ['bookingDate', 'booking_date'],
  date: ['date', 'consultationDate', 'consultation_date'],
  startTime: ['startTime', 'start_time'],
  endTime: ['endTime', 'end_time'],
  status: ['status', 'consultationStatus', 'consultation_status'],
  mode: ['consultationMode', 'consultation_mode', 'mode'],
  videoLink: ['videoLink', 'video_link'],
  callNumber: ['callNumber', 'call_number'],
  chatTranscriptId: ['chatTranscriptId', 'chat_transcript_id']
};

export function toConsultation(row: Row): Consultation {
  return {
    id: pickString(row, consultationKeys.id),
    patientId: pickString(row, consultationKeys.patientId),
    doctorId: pickString(row, consultationKeys.doctorId),
    patientName: pickString(row, consultationKeys.patientName),
    doctorName: pickString(row, consultationKeys.doctorName),
    bookingDate: pickString(row, consultationKeys.bookingDate),
    date: pickString(row, consultationKeys.date),
    startTime: pickString(row, consultationKeys.startTime),
    endTime: pickString(row, consultationKeys.endTime),
    status: pickString(row, consultationKeys.status),
    mode: pickString(row, consultationKeys.mode),
    videoLink: pickString(row, consultationKeys.videoLink),
    callNumber: pickString(row, consultationKeys.callNumber),
    chatTranscriptId: pickString(row, consultationKeys.chatTranscriptId),
    raw: row
  };
}

export const prescriptionKeys = {
  id: ['prescriptionId', 'prescription_id', 'id'],
  consultationId: ['consultationId', 'consultation_id'],
  date: ['prescriptionDate', 'prescription_date', 'date'],
  dosage: ['dosage']
};

export function toPrescription(row: Row): Prescription {
  return {
    id: pickString(row, prescriptionKeys.id),
    consultationId: pickString(row, prescriptionKeys.consultationId),
    prescriptionDate: pickString(row, prescriptionKeys.date),
    dosage: pickString(row, prescriptionKeys.dosage),
    raw: row
  };
}

export const medicineKeys = {
  id: ['medicineId', 'medicine_id', 'id'],
  name: ['medicineName', 'medicine_name', 'name'],
  type: ['medicineType', 'medicine_type', 'type']
};

export function toMedicine(row: Row): Medicine {
  return {
    id: pickString(row, medicineKeys.id),
    name: pickString(row, medicineKeys.name),
    type: pickString(row, medicineKeys.type),
    raw: row
  };
}

export const testKeys = {
  id: ['testId', 'test_id', 'id'],
  name: ['testName', 'test_name', 'name'],
  type: ['testType', 'test_type', 'type']
};

export function toTest(row: Row): MedicalTest {
  return {
    id: pickString(row, testKeys.id),
    name: pickString(row, testKeys.name),
    type: pickString(row, testKeys.type),
    raw: row
  };
}

export const paymentKeys = {
  id: ['paymentId', 'payment_id', 'id'],
  consultationId: ['consultationId', 'consultation_id'],
  amount: ['paymentAmount', 'payment_amount', 'amount'],
  paidBy: ['paidBy', 'paid_by', 'paymentMethod', 'payment_method', 'method']
};

export function toPayment(row: Row): Payment {
  return {
    id: pickString(row, paymentKeys.id),
    consultationId: pickString(row, paymentKeys.consultationId),
    amount: pickNumber(row, paymentKeys.amount),
    paidBy: pickString(row, paymentKeys.paidBy),
    raw: row
  };
}

/**
 * Dashboard aggregate rows differ per query (status/city/specialization/method).
 * One tolerant reader keeps every chart working whatever the DTO is called.
 */
export function toAggregate(row: Row, labelKeys: string[]): Aggregate {
  return {
    label: pickString(row, [...labelKeys, 'label', 'name', 'key', 'category', 'groupName']) || 'Unspecified',
    count:
    pickNumber(row, [
    'count',
    'total',
    'cnt',
    'numberOfPayments',
    'number_of_payments',
    'paymentCount',
    'value',
    'qty']
    ) ?? 0,
    amount: pickNumber(row, ['amount', 'totalAmount', 'total_amount', 'sum', 'revenue', 'paymentAmount'])
  };
}