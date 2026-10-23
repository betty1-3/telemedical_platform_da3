-- Demo data. Parent rows are inserted before their dependent rows.

INSERT INTO patient VALUES (1, 'Aarav', 'Sharma', DATE '1998-05-14', 'M', 'Mumbai', 'Andheri', '400053');
INSERT INTO patient VALUES (2, 'Priya', 'Patel', DATE '1992-11-22', 'F', 'Mumbai', 'Bandra', '400050');
INSERT INTO patient VALUES (3, 'Rohan', 'Gupta', DATE '1985-02-03', 'M', 'Pune', 'Kothrud', '411038');
INSERT INTO patient VALUES (4, 'Neha', 'Singh', DATE '2000-08-19', 'F', 'Delhi', 'Rohini', '110085');
INSERT INTO patient VALUES (5, 'Kabir', 'Khan', DATE '1978-12-10', 'M', 'Bengaluru', 'Indiranagar', '560038');
INSERT INTO patient VALUES (6, 'Ananya', 'Iyer', DATE '1995-06-27', 'F', 'Chennai', 'Adyar', '600020');

INSERT INTO doctor VALUES (101, 'Meera', 'Nair', 'F', DATE '1978-03-12', DATE '2005-07-01', 'MH-10001', 18);
INSERT INTO doctor VALUES (102, 'Vikram', 'Rao', 'M', DATE '1975-09-28', DATE '2002-05-15', 'MH-10002', 21);
INSERT INTO doctor VALUES (103, 'Sonal', 'Desai', 'F', DATE '1982-01-17', DATE '2010-08-10', 'MH-10003', 14);
INSERT INTO doctor VALUES (104, 'Arjun', 'Menon', 'M', DATE '1980-07-05', DATE '2008-01-20', 'DL-10004', 16);
INSERT INTO doctor VALUES (105, 'Riya', 'Kapoor', 'F', DATE '1987-10-09', DATE '2013-06-05', 'KA-10005', 11);

INSERT INTO hospital VALUES (201, 'City Care Hospital', 'Link Road', 'Andheri', 'Mumbai', '400053');
INSERT INTO hospital VALUES (202, 'Metro Health Centre', 'FC Road', 'Shivajinagar', 'Pune', '411004');
INSERT INTO hospital VALUES (203, 'Lifeline Hospital', 'Outer Ring Road', 'Rohini', 'Delhi', '110085');

INSERT INTO medicine VALUES (301, 'Paracetamol', 'TABLET');
INSERT INTO medicine VALUES (302, 'Amoxicillin', 'DRUG');
INSERT INTO medicine VALUES (303, 'Insulin', 'INJECTION');
INSERT INTO medicine VALUES (304, 'Cough Relief', 'SYRUP');
INSERT INTO medicine VALUES (305, 'Vitamin D', 'TABLET');

INSERT INTO test VALUES (401, 'Complete Blood Count', 'BLOOD_TEST');
INSERT INTO test VALUES (402, 'Chest X-Ray', 'X_RAY');
INSERT INTO test VALUES (403, 'Routine Urine Analysis', 'URINE_TEST');
INSERT INTO test VALUES (404, 'Resting ECG', 'ECG');

INSERT INTO patient_phone VALUES (1, '9876500001');
INSERT INTO patient_phone VALUES (1, '9876500002');
INSERT INTO patient_phone VALUES (2, '9876500003');
INSERT INTO patient_phone VALUES (3, '9876500004');
INSERT INTO patient_phone VALUES (4, '9876500005');
INSERT INTO patient_phone VALUES (5, '9876500006');
INSERT INTO patient_phone VALUES (6, '9876500007');

INSERT INTO doctor_phone VALUES (101, '9123400001');
INSERT INTO doctor_phone VALUES (102, '9123400002');
INSERT INTO doctor_phone VALUES (103, '9123400003');
INSERT INTO doctor_phone VALUES (104, '9123400004');
INSERT INTO doctor_phone VALUES (105, '9123400005');

INSERT INTO doctor_qualification VALUES (101, 'MBBS');
INSERT INTO doctor_qualification VALUES (101, 'MD General Medicine');
INSERT INTO doctor_qualification VALUES (102, 'MBBS');
INSERT INTO doctor_qualification VALUES (102, 'DM Cardiology');
INSERT INTO doctor_qualification VALUES (103, 'MBBS');
INSERT INTO doctor_qualification VALUES (103, 'MD Dermatology');
INSERT INTO doctor_qualification VALUES (104, 'MBBS');
INSERT INTO doctor_qualification VALUES (104, 'DM Neurology');
INSERT INTO doctor_qualification VALUES (105, 'MBBS');
INSERT INTO doctor_qualification VALUES (105, 'MD Psychiatry');

INSERT INTO doctor_rating VALUES (101, 5);
INSERT INTO doctor_rating VALUES (102, 4);
INSERT INTO doctor_rating VALUES (103, 4);
INSERT INTO doctor_rating VALUES (104, 5);
INSERT INTO doctor_rating VALUES (105, 4);

INSERT INTO doctor_specialization VALUES (101, 'GENERAL_PHYSICIAN');
INSERT INTO doctor_specialization VALUES (102, 'CARDIOLOGIST');
INSERT INTO doctor_specialization VALUES (103, 'DERMATOLOGIST');
INSERT INTO doctor_specialization VALUES (104, 'NEUROLOGIST');
INSERT INTO doctor_specialization VALUES (105, 'PSYCHIATRIST');

INSERT INTO hospital_phone VALUES (201, '02240001001');
INSERT INTO hospital_phone VALUES (202, '02040001002');
INSERT INTO hospital_phone VALUES (203, '01140001003');

INSERT INTO hospital_doctor VALUES (201, 101, 'Consultant');
INSERT INTO hospital_doctor VALUES (201, 102, 'Visiting Consultant');
INSERT INTO hospital_doctor VALUES (201, 103, 'Consultant');
INSERT INTO hospital_doctor VALUES (202, 101, 'Visiting Consultant');
INSERT INTO hospital_doctor VALUES (202, 105, 'Consultant');
INSERT INTO hospital_doctor VALUES (203, 104, 'Consultant');

INSERT INTO medical_record VALUES (501, 1, 'Fever and body ache', 'Viral fever');
INSERT INTO medical_record VALUES (502, 2, 'Skin rash and itching', 'Allergic dermatitis');
INSERT INTO medical_record VALUES (503, 3, 'Chest discomfort', 'Hypertension under evaluation');
INSERT INTO medical_record VALUES (504, 4, 'Frequent headache', 'Migraine');
INSERT INTO medical_record VALUES (505, 5, 'Sleep difficulty', 'Insomnia');
INSERT INTO medical_record VALUES (506, 6, 'Cough and sore throat', 'Upper respiratory infection');

INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating)
VALUES (601, 1, 'Clear explanation and helpful advice.', 5);
INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating)
VALUES (602, 2, 'Appointment was on time.', 4);
INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating)
VALUES (603, 4, 'The consultation was thorough.', 5);
INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating)
VALUES (604, 6, 'Good online consultation experience.', 4);

INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (701, 1, 101, DATE '2026-08-01', DATE '2026-08-03', '10:00', '10:20', 'COMPLETED', 'VIDEO', 'https://meet.example/701', NULL, NULL);
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (702, 2, 103, DATE '2026-08-02', DATE '2026-08-04', '11:00', '11:15', 'COMPLETED', 'CHAT', NULL, NULL, 'CHAT-702');
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (703, 3, 102, DATE '2026-08-03', DATE '2026-08-05', '14:00', '14:30', 'COMPLETED', 'AUDIO', NULL, '1800703', NULL);
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (704, 4, 104, DATE '2026-08-04', DATE '2026-08-06', '09:30', '10:00', 'SCHEDULED', 'VIDEO', 'https://meet.example/704', NULL, NULL);
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (705, 5, 105, DATE '2026-08-05', DATE '2026-08-07', '16:00', '16:25', 'COMPLETED', 'CHAT', NULL, NULL, 'CHAT-705');
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (706, 6, 101, DATE '2026-08-06', DATE '2026-08-08', '12:00', '12:20', 'CANCELLED', 'AUDIO', NULL, '1800706', NULL);
INSERT INTO consultation (consultation_id, patient_id, doctor_id, booking_date, "Date", start_time, end_time, status, consultation_mode, video_link, call_number, chat_transcript_id)
VALUES (707, 1, 102, DATE '2026-08-08', DATE '2026-08-10', '15:00', '15:30', 'SCHEDULED', 'VIDEO', 'https://meet.example/707', NULL, NULL);

INSERT INTO payment VALUES (801, 701, 500.00, 'UPI');
INSERT INTO payment VALUES (802, 702, 650.00, 'CARD');
INSERT INTO payment VALUES (803, 703, 900.00, 'NETBANKING');
INSERT INTO payment VALUES (804, 705, 700.00, 'COD');

INSERT INTO prescription VALUES (901, 701, DATE '2026-08-03', 'Paracetamol: one tablet after meals for three days');
INSERT INTO prescription VALUES (902, 702, DATE '2026-08-04', 'Apply prescribed medicine twice daily');
INSERT INTO prescription VALUES (903, 703, DATE '2026-08-05', 'Take medicine as advised after test results');
INSERT INTO prescription VALUES (904, 705, DATE '2026-08-07', 'One tablet at bedtime for seven days');

INSERT INTO prescription_medicine VALUES (901, 301);
INSERT INTO prescription_medicine VALUES (901, 305);
INSERT INTO prescription_medicine VALUES (902, 302);
INSERT INTO prescription_medicine VALUES (903, 305);
INSERT INTO prescription_medicine VALUES (904, 305);

INSERT INTO prescription_test VALUES (901, 401);
INSERT INTO prescription_test VALUES (902, 403);
INSERT INTO prescription_test VALUES (903, 404);

COMMIT;
