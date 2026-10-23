-- Primary keys and unique constraints already create their own indexes.
-- These indexes support foreign-key joins and common dashboard filters.

CREATE INDEX idx_feedback_patient ON feedback (patient_id);
CREATE INDEX idx_medical_record_patient ON medical_record (patient_id);
CREATE INDEX idx_hospital_doctor_doctor ON hospital_doctor (doctor_id);
CREATE INDEX idx_consultation_patient ON consultation (patient_id);
CREATE INDEX idx_consultation_doctor_date ON consultation (doctor_id, "Date");
CREATE INDEX idx_payment_consultation ON payment (consultation_id);
CREATE INDEX idx_prescription_consultation ON prescription (consultation_id);
CREATE INDEX idx_patient_city ON patient (city);
CREATE INDEX idx_hospital_city ON hospital (city);
CREATE INDEX idx_consultation_status ON consultation (status);
