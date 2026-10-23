// Run once before seed.cypher. These constraints make each graph node's
// identifier unique and also create the lookup indexes used by MERGE.

CREATE CONSTRAINT patient_patient_id_unique IF NOT EXISTS
FOR (patient:Patient) REQUIRE patient.patientId IS UNIQUE;

CREATE CONSTRAINT doctor_doctor_id_unique IF NOT EXISTS
FOR (doctor:Doctor) REQUIRE doctor.doctorId IS UNIQUE;

CREATE CONSTRAINT appointment_appointment_id_unique IF NOT EXISTS
FOR (appointment:Appointment) REQUIRE appointment.appointmentId IS UNIQUE;

CREATE CONSTRAINT specialization_code_unique IF NOT EXISTS
FOR (specialization:Specialization) REQUIRE specialization.code IS UNIQUE;

CREATE CONSTRAINT hospital_id_unique IF NOT EXISTS
FOR (hospital:Hospital) REQUIRE hospital.hospitalId IS UNIQUE;

CREATE CONSTRAINT prescription_id_unique IF NOT EXISTS
FOR (prescription:Prescription) REQUIRE prescription.prescriptionId IS UNIQUE;

CREATE CONSTRAINT medicine_id_unique IF NOT EXISTS
FOR (medicine:Medicine) REQUIRE medicine.medicineId IS UNIQUE;

CREATE CONSTRAINT test_id_unique IF NOT EXISTS
FOR (test:Test) REQUIRE test.testId IS UNIQUE;
