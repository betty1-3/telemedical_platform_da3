-- Primary, foreign, unique, NOT NULL, and CHECK constraints for the 19-table schema.

ALTER TABLE patient ADD CONSTRAINT pk_patient PRIMARY KEY (patient_id);
ALTER TABLE patient MODIFY (first_name CONSTRAINT nn_patient_first_name NOT NULL,
                            last_name CONSTRAINT nn_patient_last_name NOT NULL,
                            dob CONSTRAINT nn_patient_dob NOT NULL,
                            city CONSTRAINT nn_patient_city NOT NULL);
ALTER TABLE patient ADD CONSTRAINT ck_patient_gender CHECK (gender IN ('M', 'F', 'O'));

ALTER TABLE doctor ADD CONSTRAINT pk_doctor PRIMARY KEY (doctor_id);
ALTER TABLE doctor MODIFY (first_name CONSTRAINT nn_doctor_first_name NOT NULL,
                           last_name CONSTRAINT nn_doctor_last_name NOT NULL,
                           dob CONSTRAINT nn_doctor_dob NOT NULL,
                           date_joined CONSTRAINT nn_doctor_date_joined NOT NULL,
                           license_no CONSTRAINT nn_doctor_license_no NOT NULL);
ALTER TABLE doctor ADD CONSTRAINT uq_doctor_license_no UNIQUE (license_no);
ALTER TABLE doctor ADD CONSTRAINT ck_doctor_gender CHECK (gender IN ('M', 'F', 'O'));
ALTER TABLE doctor ADD CONSTRAINT ck_doctor_experience CHECK (experience >= 0);

ALTER TABLE hospital ADD CONSTRAINT pk_hospital PRIMARY KEY (hospital_id);
ALTER TABLE hospital MODIFY (name CONSTRAINT nn_hospital_name NOT NULL,
                             city CONSTRAINT nn_hospital_city NOT NULL);

ALTER TABLE medicine ADD CONSTRAINT pk_medicine PRIMARY KEY (medicine_id);
ALTER TABLE medicine MODIFY (medicine_name CONSTRAINT nn_medicine_name NOT NULL);
ALTER TABLE medicine ADD CONSTRAINT ck_medicine_type
    CHECK (medicine_type IN ('DRUG', 'INJECTION', 'TABLET', 'SYRUP'));

ALTER TABLE test ADD CONSTRAINT pk_test PRIMARY KEY (test_id);
ALTER TABLE test MODIFY (test_name CONSTRAINT nn_test_name NOT NULL);
ALTER TABLE test ADD CONSTRAINT ck_test_type
    CHECK (test_type IN ('BLOOD_TEST', 'X_RAY', 'URINE_TEST', 'ECG'));

ALTER TABLE patient_phone ADD CONSTRAINT pk_patient_phone PRIMARY KEY (patient_id, phone_no);
ALTER TABLE patient_phone ADD CONSTRAINT fk_patient_phone_patient
    FOREIGN KEY (patient_id) REFERENCES patient (patient_id);

ALTER TABLE feedback ADD CONSTRAINT pk_feedback PRIMARY KEY (feedback_id);
ALTER TABLE feedback ADD CONSTRAINT fk_feedback_patient
    FOREIGN KEY (patient_id) REFERENCES patient (patient_id);
ALTER TABLE feedback ADD CONSTRAINT ck_feedback_rating CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE medical_record ADD CONSTRAINT pk_medical_record PRIMARY KEY (medical_record_id);
ALTER TABLE medical_record ADD CONSTRAINT fk_medical_record_patient
    FOREIGN KEY (patient_id) REFERENCES patient (patient_id);

ALTER TABLE doctor_phone ADD CONSTRAINT pk_doctor_phone PRIMARY KEY (doctor_id, phone_no);
ALTER TABLE doctor_phone ADD CONSTRAINT fk_doctor_phone_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);

ALTER TABLE doctor_qualification ADD CONSTRAINT pk_doctor_qualification PRIMARY KEY (doctor_id, qualification);
ALTER TABLE doctor_qualification ADD CONSTRAINT fk_doctor_qualification_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);

ALTER TABLE doctor_rating ADD CONSTRAINT pk_doctor_rating PRIMARY KEY (doctor_id);
ALTER TABLE doctor_rating ADD CONSTRAINT fk_doctor_rating_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);
ALTER TABLE doctor_rating ADD CONSTRAINT ck_doctor_rating_value CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE doctor_specialization ADD CONSTRAINT pk_doctor_specialization PRIMARY KEY (doctor_id);
ALTER TABLE doctor_specialization ADD CONSTRAINT fk_doctor_specialization_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);
ALTER TABLE doctor_specialization ADD CONSTRAINT ck_doctor_specialization
    CHECK (specialization IN ('GENERAL_PHYSICIAN', 'CARDIOLOGIST', 'NEUROLOGIST', 'DERMATOLOGIST', 'PSYCHIATRIST'));

ALTER TABLE hospital_phone ADD CONSTRAINT pk_hospital_phone PRIMARY KEY (hospital_id, contact_no);
ALTER TABLE hospital_phone ADD CONSTRAINT fk_hospital_phone_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospital (hospital_id);

ALTER TABLE hospital_doctor ADD CONSTRAINT pk_hospital_doctor PRIMARY KEY (hospital_id, doctor_id);
ALTER TABLE hospital_doctor ADD CONSTRAINT fk_hospital_doctor_hospital
    FOREIGN KEY (hospital_id) REFERENCES hospital (hospital_id);
ALTER TABLE hospital_doctor ADD CONSTRAINT fk_hospital_doctor_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);

ALTER TABLE consultation ADD CONSTRAINT pk_consultation PRIMARY KEY (consultation_id);
ALTER TABLE consultation MODIFY (booking_date CONSTRAINT nn_consultation_booking_date NOT NULL,
                                 "Date" CONSTRAINT nn_consultation_date NOT NULL,
                                 start_time CONSTRAINT nn_consultation_start_time NOT NULL,
                                 end_time CONSTRAINT nn_consultation_end_time NOT NULL,
                                 status CONSTRAINT nn_consultation_status NOT NULL);
ALTER TABLE consultation ADD CONSTRAINT fk_consultation_patient
    FOREIGN KEY (patient_id) REFERENCES patient (patient_id);
ALTER TABLE consultation ADD CONSTRAINT fk_consultation_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctor (doctor_id);
ALTER TABLE consultation ADD CONSTRAINT ck_consultation_mode
    CHECK (consultation_mode IN ('VIDEO', 'AUDIO', 'CHAT'));

ALTER TABLE payment ADD CONSTRAINT pk_payment PRIMARY KEY (payment_id);
ALTER TABLE payment ADD CONSTRAINT fk_payment_consultation
    FOREIGN KEY (consultation_id) REFERENCES consultation (consultation_id);
ALTER TABLE payment ADD CONSTRAINT ck_payment_amount CHECK (payment_amount > 0);
ALTER TABLE payment ADD CONSTRAINT ck_payment_paid_by
    CHECK (paid_by IN ('COD', 'UPI', 'CARD', 'NETBANKING'));

ALTER TABLE prescription ADD CONSTRAINT pk_prescription PRIMARY KEY (prescription_id);
ALTER TABLE prescription MODIFY (p_date CONSTRAINT nn_prescription_date NOT NULL);
ALTER TABLE prescription ADD CONSTRAINT fk_prescription_consultation
    FOREIGN KEY (consultation_id) REFERENCES consultation (consultation_id);

ALTER TABLE prescription_medicine ADD CONSTRAINT pk_prescription_medicine PRIMARY KEY (prescription_id, medicine_id);
ALTER TABLE prescription_medicine ADD CONSTRAINT fk_prescription_medicine_prescription
    FOREIGN KEY (prescription_id) REFERENCES prescription (prescription_id);
ALTER TABLE prescription_medicine ADD CONSTRAINT fk_prescription_medicine_medicine
    FOREIGN KEY (medicine_id) REFERENCES medicine (medicine_id);

ALTER TABLE prescription_test ADD CONSTRAINT pk_prescription_test PRIMARY KEY (prescription_id, test_id);
ALTER TABLE prescription_test ADD CONSTRAINT fk_prescription_test_prescription
    FOREIGN KEY (prescription_id) REFERENCES prescription (prescription_id);
ALTER TABLE prescription_test ADD CONSTRAINT fk_prescription_test_test
    FOREIGN KEY (test_id) REFERENCES test (test_id);
