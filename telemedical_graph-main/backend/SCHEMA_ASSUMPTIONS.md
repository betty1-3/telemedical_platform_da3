# Schema reconciliation notes

`01_schema.sql` was provided and the backend below has been updated to match
it exactly. This file records the differences from the original guesses
(previously documented here) in case you're comparing against an older
version of this backend.

| Table | Real columns | What changed from the original guess |
|---|---|---|
| `PATIENT` | `patient_id`, `first_name`, `last_name`, `dob`, `gender`, `city`, `area`, `pincode` | no `email`/`registered_date`; has `area`, `pincode` instead |
| `DOCTOR` | `doctor_id`, `first_name`, `last_name`, `gender`, `dob`, `date_joined`, `license_no`, `experience` | column is `license_no`, not `license_number` |
| `HOSPITAL` | `hospital_id`, `name`, `street`, `area`, `city`, `pincode` | column is `name`, not `hospital_name`; no single `address` - split into `street`/`area`/`pincode` |
| `MEDICINE` | `medicine_id`, `medicine_name`, `medicine_type` | no `manufacturer`/`price` |
| `TEST` | `test_id`, `test_name`, `test_type` | no `cost` |
| `PATIENT_PHONE` | `patient_id`, `phone_no` | column is `phone_no`, not `phone_number` |
| `FEEDBACK` | `feedback_id`, `patient_id`, `feedback_comment`, `rating` | matches - no change |
| `MEDICAL_RECORD` | `medical_record_id`, `patient_id`, `symptoms`, `diagnoses` | id column is `medical_record_id`, not `record_id`; columns are `symptoms`/`diagnoses`, not `diagnosis`/`record_date`/`notes` |
| `DOCTOR_PHONE` | `doctor_id`, `phone_no` | column is `phone_no`, not `phone_number` |
| `DOCTOR_QUALIFICATION` | `doctor_id`, `qualification` | **no surrogate `qualification_id`** - table has only these two columns |
| `DOCTOR_RATING` | `doctor_id`, `rating` | **no surrogate `rating_id`**, no `patient_id`, no `rating_comment` |
| `DOCTOR_SPECIALIZATION` | `doctor_id`, `specialization` | **no surrogate `specialization_id`**; column is `specialization`, not `specialization_name` |
| `HOSPITAL_PHONE` | `hospital_id`, `contact_no` | column is `contact_no`, not `phone_number`/`phone_no` |
| `HOSPITAL_DOCTOR` | `hospital_id`, `doctor_id`, `role` | has an extra `role` column (Map-based repo already handles this - just include `role` in the request body) |
| `CONSULTATION` | `consultation_id`, `patient_id`, `doctor_id`, `booking_date`, `"Date"`, `start_time`, `end_time`, `status`, `consultation_mode`, `video_link`, `call_number`, `chat_transcript_id` | matches exactly - no change |
| `PAYMENT` | `payment_id`, `consultation_id`, `payment_amount`, `paid_by` | columns are `payment_amount`/`paid_by`; no `payment_date`/`payment_status` |
| `PRESCRIPTION` | `prescription_id`, `consultation_id`, `p_date`, `dosage` | columns are `p_date`/`dosage`; **no `doctor_id`/`patient_id`/`notes`** |
| `PRESCRIPTION_MEDICINE` | `prescription_id`, `medicine_id` | no `dosage`/`duration` columns |
| `PRESCRIPTION_TEST` | `prescription_id`, `test_id` | no `result`/`test_date` columns |

## Endpoints affected by "no surrogate key" tables

`DOCTOR_QUALIFICATION`, `DOCTOR_RATING`, and `DOCTOR_SPECIALIZATION` have no
id column at all, so - like the phone tables and the `*_DOCTOR`/`*_MEDICINE`/
`*_TEST` link tables - they no longer expose `GET/PUT/DELETE /{id}`. Instead:

- `GET /api/doctor-qualifications`, `GET /api/doctor-qualifications/doctor/{doctorId}`, `POST`, and `DELETE ?doctorId=&qualification=`
- `GET /api/doctor-ratings`, `GET /api/doctor-ratings/doctor/{doctorId}`, `POST`, and `DELETE ?doctorId=&rating=`
- `GET /api/doctor-specializations`, `GET /api/doctor-specializations/doctor/{doctorId}`, `POST`, and `DELETE ?doctorId=&specialization=`

## Where each table's SQL lives

Each table's SQL is isolated in one repository file, so if anything still
doesn't line up, fixing a mismatch is a one-file edit:

```
repository/PatientRepository.java
repository/DoctorRepository.java
repository/HospitalRepository.java
repository/ConsultationRepository.java
repository/PaymentRepository.java
repository/PrescriptionRepository.java
repository/MedicineRepository.java
repository/TestRepository.java
repository/GenericTableRepository.java   (all 11 supporting tables, called from their controllers)
```

controllers and services never reference column names directly except in
the few validation checks noted above, so nothing else needs to change.
