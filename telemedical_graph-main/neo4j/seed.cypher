// Repeatable graph projection of the relational project's bundled DEMO data.
// It uses the same PATIENT, DOCTOR, and CONSULTATION identifiers as
// database/04_seed_data.sql. No real patient information is included.
// Each MERGE uses a constrained identifier, so this file is safe to rerun.

UNWIND [
  {code: 'GENERAL_PHYSICIAN', name: 'General Physician'},
  {code: 'CARDIOLOGIST', name: 'Cardiologist'},
  {code: 'DERMATOLOGIST', name: 'Dermatologist'},
  {code: 'NEUROLOGIST', name: 'Neurologist'},
  {code: 'PSYCHIATRIST', name: 'Psychiatrist'}
] AS row
MERGE (specialization:Specialization {code: row.code})
SET specialization.name = row.name,
    specialization.synthetic = true,
    specialization.sourceSystem = 'DEMO';

UNWIND [
  {patientId: 1, city: 'Mumbai'},
  {patientId: 2, city: 'Mumbai'},
  {patientId: 3, city: 'Pune'},
  {patientId: 4, city: 'Delhi'},
  {patientId: 5, city: 'Bengaluru'},
  {patientId: 6, city: 'Chennai'}
] AS row
MERGE (patient:Patient {patientId: row.patientId})
SET patient.city = row.city,
    patient.synthetic = true,
    patient.sourceSystem = 'DEMO';

UNWIND [
  {doctorId: 101, firstName: 'Meera', lastName: 'Nair', yearsExperience: 18},
  {doctorId: 102, firstName: 'Vikram', lastName: 'Rao', yearsExperience: 21},
  {doctorId: 103, firstName: 'Sonal', lastName: 'Desai', yearsExperience: 14},
  {doctorId: 104, firstName: 'Arjun', lastName: 'Menon', yearsExperience: 16},
  {doctorId: 105, firstName: 'Riya', lastName: 'Kapoor', yearsExperience: 11}
] AS row
MERGE (doctor:Doctor {doctorId: row.doctorId})
SET doctor.firstName = row.firstName,
    doctor.lastName = row.lastName,
    doctor.name = 'Dr. ' + row.firstName + ' ' + row.lastName,
    doctor.yearsExperience = row.yearsExperience,
    doctor.synthetic = true,
    doctor.sourceSystem = 'DEMO';

// Mirrors the actual one-specialization-per-doctor rows in DOCTOR_SPECIALIZATION.
UNWIND [
  {doctorId: 101, specializationCode: 'GENERAL_PHYSICIAN'},
  {doctorId: 102, specializationCode: 'CARDIOLOGIST'},
  {doctorId: 103, specializationCode: 'DERMATOLOGIST'},
  {doctorId: 104, specializationCode: 'NEUROLOGIST'},
  {doctorId: 105, specializationCode: 'PSYCHIATRIST'}
] AS row
MATCH (doctor:Doctor {doctorId: row.doctorId})
MATCH (specialization:Specialization {code: row.specializationCode})
MERGE (doctor)-[:SPECIALIZES_IN]->(specialization);

// Appointment is the graph label for the relational CONSULTATION entity.
UNWIND [
  {appointmentId: 701, patientId: 1, doctorId: 101, appointmentDate: '2026-08-03', status: 'COMPLETED', mode: 'VIDEO'},
  {appointmentId: 702, patientId: 2, doctorId: 103, appointmentDate: '2026-08-04', status: 'COMPLETED', mode: 'CHAT'},
  {appointmentId: 703, patientId: 3, doctorId: 102, appointmentDate: '2026-08-05', status: 'COMPLETED', mode: 'AUDIO'},
  {appointmentId: 704, patientId: 4, doctorId: 104, appointmentDate: '2026-08-06', status: 'SCHEDULED', mode: 'VIDEO'},
  {appointmentId: 705, patientId: 5, doctorId: 105, appointmentDate: '2026-08-07', status: 'COMPLETED', mode: 'CHAT'},
  {appointmentId: 706, patientId: 6, doctorId: 101, appointmentDate: '2026-08-08', status: 'CANCELLED', mode: 'AUDIO'},
  {appointmentId: 707, patientId: 1, doctorId: 102, appointmentDate: '2026-08-10', status: 'SCHEDULED', mode: 'VIDEO'}
] AS row
MERGE (patient:Patient {patientId: row.patientId})
ON CREATE SET patient.synthetic = true
MATCH (doctor:Doctor {doctorId: row.doctorId})
MERGE (appointment:Appointment {appointmentId: row.appointmentId})
SET appointment.appointmentDate = date(row.appointmentDate),
    appointment.status = row.status,
    appointment.mode = row.mode,
    appointment.sourceEntity = 'CONSULTATION',
    appointment.synthetic = true,
    appointment.sourceSystem = 'DEMO'
MERGE (patient)-[:BOOKED]->(appointment)
// WITH is escaped because it is a Cypher keyword; its stored relationship type is WITH.
MERGE (appointment)-[:`WITH`]->(doctor);

// CONSULTED is derived only from a completed CONSULTATION node. It adds no
// separate relational fact and retains the source consultation ID.
MATCH (patient:Patient)-[:BOOKED]->(appointment:Appointment {status: 'COMPLETED'})-[:`WITH`]->(doctor:Doctor)
MERGE (patient)-[consulted:CONSULTED {appointmentId: appointment.appointmentId}]->(doctor)
SET consulted.on = appointment.appointmentDate;

// REFERRED_TO is a deliberately new, graph-only prototype feature. It is
// synthetic and has no Oracle equivalent, so it is always returned as such.
UNWIND [
  {fromDoctorId: 101, toDoctorId: 102, reason: 'Cardiac review', referredOn: '2026-08-03'},
  {fromDoctorId: 101, toDoctorId: 104, reason: 'Neurology assessment', referredOn: '2026-08-04'},
  {fromDoctorId: 104, toDoctorId: 105, reason: 'Behavioural health support', referredOn: '2026-08-06'}
] AS row
MATCH (from:Doctor {doctorId: row.fromDoctorId})
MATCH (to:Doctor {doctorId: row.toDoctorId})
MERGE (from)-[referral:REFERRED_TO]->(to)
SET referral.reason = row.reason,
    referral.referredOn = date(row.referredOn),
    referral.synthetic = true,
    referral.sourceSystem = 'DEMO';

// Remaining entities and foreign-key/junction relationships mirror the demo
// rows in database/04_seed_data.sql. All records below are synthetic examples.
UNWIND [
  {hospitalId: 201, name: 'City Care Hospital', city: 'Mumbai'},
  {hospitalId: 202, name: 'Metro Health Centre', city: 'Pune'},
  {hospitalId: 203, name: 'Lifeline Hospital', city: 'Delhi'}
] AS row
MERGE (hospital:Hospital {hospitalId: row.hospitalId})
SET hospital.name = row.name, hospital.city = row.city, hospital.synthetic = true, hospital.sourceSystem = 'DEMO';

UNWIND [
  {hospitalId: 201, doctorId: 101, role: 'Consultant'},
  {hospitalId: 201, doctorId: 102, role: 'Visiting Consultant'},
  {hospitalId: 201, doctorId: 103, role: 'Consultant'},
  {hospitalId: 202, doctorId: 101, role: 'Visiting Consultant'},
  {hospitalId: 202, doctorId: 105, role: 'Consultant'},
  {hospitalId: 203, doctorId: 104, role: 'Consultant'}
] AS row
MATCH (hospital:Hospital {hospitalId: row.hospitalId})
MATCH (doctor:Doctor {doctorId: row.doctorId})
MERGE (doctor)-[affiliation:AFFILIATED_WITH]->(hospital)
SET affiliation.role = row.role, affiliation.synthetic = true;

UNWIND [
  {medicineId: 301, name: 'Paracetamol', medicineType: 'TABLET'},
  {medicineId: 302, name: 'Amoxicillin', medicineType: 'DRUG'},
  {medicineId: 303, name: 'Insulin', medicineType: 'INJECTION'},
  {medicineId: 304, name: 'Cough Relief', medicineType: 'SYRUP'},
  {medicineId: 305, name: 'Vitamin D', medicineType: 'TABLET'}
] AS row
MERGE (medicine:Medicine {medicineId: row.medicineId})
SET medicine.name = row.name, medicine.type = row.medicineType, medicine.synthetic = true, medicine.sourceSystem = 'DEMO';

UNWIND [
  {testId: 401, name: 'Complete Blood Count', testType: 'BLOOD_TEST'},
  {testId: 402, name: 'Chest X-Ray', testType: 'X_RAY'},
  {testId: 403, name: 'Routine Urine Analysis', testType: 'URINE_TEST'},
  {testId: 404, name: 'Resting ECG', testType: 'ECG'}
] AS row
MERGE (test:Test {testId: row.testId})
SET test.name = row.name, test.type = row.testType, test.synthetic = true, test.sourceSystem = 'DEMO';

UNWIND [
  {prescriptionId: 901, consultationId: 701, pDate: '2026-08-03', dosage: 'Paracetamol: one tablet after meals for three days'},
  {prescriptionId: 902, consultationId: 702, pDate: '2026-08-04', dosage: 'Apply prescribed medicine twice daily'},
  {prescriptionId: 903, consultationId: 703, pDate: '2026-08-05', dosage: 'Take medicine as advised after test results'},
  {prescriptionId: 904, consultationId: 705, pDate: '2026-08-07', dosage: 'One tablet at bedtime for seven days'}
] AS row
MATCH (consultation:Appointment {appointmentId: row.consultationId})
MERGE (prescription:Prescription {prescriptionId: row.prescriptionId})
SET prescription.date = date(row.pDate), prescription.dosage = row.dosage,
    prescription.synthetic = true, prescription.sourceSystem = 'DEMO'
MERGE (consultation)-[:HAS_PRESCRIPTION]->(prescription);

UNWIND [
  {prescriptionId: 901, medicineId: 301}, {prescriptionId: 901, medicineId: 305},
  {prescriptionId: 902, medicineId: 302}, {prescriptionId: 903, medicineId: 305},
  {prescriptionId: 904, medicineId: 305}
] AS row
MATCH (prescription:Prescription {prescriptionId: row.prescriptionId})
MATCH (medicine:Medicine {medicineId: row.medicineId})
MERGE (prescription)-[:PRESCRIBES]->(medicine);

UNWIND [
  {prescriptionId: 901, testId: 401}, {prescriptionId: 902, testId: 403},
  {prescriptionId: 903, testId: 404}
] AS row
MATCH (prescription:Prescription {prescriptionId: row.prescriptionId})
MATCH (test:Test {testId: row.testId})
MERGE (prescription)-[:ORDERS_TEST]->(test);
