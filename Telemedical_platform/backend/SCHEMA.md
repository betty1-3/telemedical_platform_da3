# Database and Backend Contract

The backend is written for the Oracle schema in `database/01_schema.sql` and the constraints in `database/02_constraints.sql`.

## ID generation

The schema defines numeric primary-key columns as plain `NUMBER` columns. They are not Oracle identity columns and the schema does not use triggers for key generation.

The seed data supplies the initial IDs. `database/07_sequences.sql` must be run after the schema, constraints, indexes, and seed data. It creates one sequence for each surrogate-key table and starts each sequence above the highest seeded ID.

The typed repositories obtain `NEXTVAL` explicitly before INSERT and include the generated ID in the INSERT statement. `GenericTableRepository` uses the same sequence mapping for `FEEDBACK` and `MEDICAL_RECORD`.

## Core entity JSON contract

The Java model property names are the REST JSON property names. They are not required to match the Oracle column names exactly.

| Entity | REST ID | Oracle ID | Notes |
|---|---|---|---|
| Patient | `patientId` | `patient_id` | Phone numbers are stored in `PATIENT_PHONE`. |
| Doctor | `doctorId` | `doctor_id` | Specialization is stored in `DOCTOR_SPECIALIZATION`. |
| Hospital | `hospitalId` | `hospital_id` | Oracle name column is `name`; REST property is `hospitalName`. |
| Medicine | `medicineId` | `medicine_id` | |
| Medical Test | `testId` | `test_id` | |
| Consultation | `consultationId` | `consultation_id` | `chatTranscriptId` is a string because Oracle uses `VARCHAR2(50)`. |
| Payment | `paymentId` | `payment_id` | REST `amount` maps to Oracle `payment_amount`; `paidBy` is the payment method. |
| Prescription | `prescriptionId` | `prescription_id` | `prescriptionDate` maps to `p_date`; medicines and tests use junction tables. |

## Supporting tables

The following tables do not have surrogate IDs and are addressed by their actual keys:

- `PATIENT_PHONE` uses `(patient_id, phone_no)`.
- `DOCTOR_PHONE` uses `(doctor_id, phone_no)`.
- `DOCTOR_QUALIFICATION` uses `(doctor_id, qualification)`.
- `DOCTOR_RATING` uses `doctor_id`.
- `DOCTOR_SPECIALIZATION` uses `doctor_id`.
- `HOSPITAL_PHONE` uses `(hospital_id, contact_no)`.
- `HOSPITAL_DOCTOR` uses `(hospital_id, doctor_id)`.
- `PRESCRIPTION_MEDICINE` uses `(prescription_id, medicine_id)`.
- `PRESCRIPTION_TEST` uses `(prescription_id, test_id)`.

## Consultation columns

The Oracle consultation table uses the quoted column `"Date"`, so repository SQL must keep that identifier quoted.

The consultation mode column is `consultation_mode`. The REST property is `consultationMode`.

`chat_transcript_id` is `VARCHAR2(50)`, so the Java and REST property `chatTranscriptId` is `String`. Values such as `CHAT-702` are valid.

## Payment contract

The database has only one payment-method field: `paid_by`. The allowed values are `COD`, `UPI`, `CARD`, and `NETBANKING`.

The REST API therefore accepts:

```json
{
  "consultationId": 701,
  "amount": 500.00,
  "paidBy": "UPI"
}
```

There is no separate `paymentMethod` or `paymentDate` property in the database contract.

## Prescription contract

A prescription contains only:

```json
{
  "consultationId": 701,
  "prescriptionDate": "2026-08-03",
  "dosage": "One tablet after meals"
}
```

Medicine and test associations are separate records in `PRESCRIPTION_MEDICINE` and `PRESCRIPTION_TEST`.

The backend deletes those junction rows before deleting a prescription so the foreign-key constraints are respected.

## Frontend integration

The frontend adapts the REST IDs to a local `id` property when rendering list pages. This is a frontend convenience only; the backend contract remains `patientId`, `doctorId`, `hospitalId`, `medicineId`, `testId`, `consultationId`, `paymentId`, and `prescriptionId`.

Patient phone numbers are synchronized through `/api/patient-phones`.

Doctor specializations are synchronized through `/api/doctor-specializations`.

Prescription medicines and tests are synchronized through `/api/prescription-medicines` and `/api/prescription-tests`.

Dashboard payment data uses the backend fields `paid_by`, `total_payments`, and `total_amount`.

## Database setup order

Run the database scripts in this order:

1. `01_schema.sql`
2. `02_constraints.sql`
3. `03_indexes.sql`
4. `04_seed_data.sql`
5. `05_queries.sql` when the query examples are needed
6. `06_plsql.sql` when the PL/SQL examples are needed
7. `07_sequences.sql`

The application requires `07_sequences.sql` before creating new records through the REST API.
