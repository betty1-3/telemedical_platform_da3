-- Hospital Management Dashboard: DA2 Oracle schema
-- This file creates exactly the 19 required tables. Constraints are added in 02_constraints.sql.

CREATE TABLE patient (
    patient_id NUMBER,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    dob DATE,
    gender CHAR(1),
    city VARCHAR2(50),
    area VARCHAR2(80),
    pincode VARCHAR2(10)
);

CREATE TABLE doctor (
    doctor_id NUMBER,
    first_name VARCHAR2(50),
    last_name VARCHAR2(50),
    gender CHAR(1),
    dob DATE,
    date_joined DATE,
    license_no VARCHAR2(30),
    experience NUMBER
);

CREATE TABLE hospital (
    hospital_id NUMBER,
    name VARCHAR2(100),
    street VARCHAR2(100),
    area VARCHAR2(80),
    city VARCHAR2(50),
    pincode VARCHAR2(10)
);

CREATE TABLE medicine (
    medicine_id NUMBER,
    medicine_name VARCHAR2(100),
    medicine_type VARCHAR2(20)
);

CREATE TABLE test (
    test_id NUMBER,
    test_name VARCHAR2(100),
    test_type VARCHAR2(20)
);

CREATE TABLE patient_phone (
    patient_id NUMBER,
    phone_no VARCHAR2(15)
);

CREATE TABLE feedback (
    feedback_id NUMBER,
    patient_id NUMBER,
    feedback_comment VARCHAR2(500),
    rating NUMBER
);

CREATE TABLE medical_record (
    medical_record_id NUMBER,
    patient_id NUMBER,
    symptoms VARCHAR2(500),
    diagnoses VARCHAR2(500)
);

CREATE TABLE doctor_phone (
    doctor_id NUMBER,
    phone_no VARCHAR2(15)
);

CREATE TABLE doctor_qualification (
    doctor_id NUMBER,
    qualification VARCHAR2(100)
);

CREATE TABLE doctor_rating (
    doctor_id NUMBER,
    rating NUMBER
);

CREATE TABLE doctor_specialization (
    doctor_id NUMBER,
    specialization VARCHAR2(30)
);

CREATE TABLE hospital_phone (
    hospital_id NUMBER,
    contact_no VARCHAR2(15)
);

CREATE TABLE hospital_doctor (
    hospital_id NUMBER,
    doctor_id NUMBER,
    role VARCHAR2(50)
);

CREATE TABLE consultation (
    consultation_id NUMBER,
    patient_id NUMBER,
    doctor_id NUMBER,
    booking_date DATE,
    "Date" DATE,
    start_time VARCHAR2(10),
    end_time VARCHAR2(10),
    status VARCHAR2(20),
    consultation_mode VARCHAR2(10),
    video_link VARCHAR2(255),
    call_number VARCHAR2(20),
    chat_transcript_id VARCHAR2(50)
);

CREATE TABLE payment (
    payment_id NUMBER,
    consultation_id NUMBER,
    payment_amount NUMBER(10,2),
    paid_by VARCHAR2(20)
);

CREATE TABLE prescription (
    prescription_id NUMBER,
    consultation_id NUMBER,
    p_date DATE,
    dosage VARCHAR2(200)
);

CREATE TABLE prescription_medicine (
    prescription_id NUMBER,
    medicine_id NUMBER
);

CREATE TABLE prescription_test (
    prescription_id NUMBER,
    test_id NUMBER
);
