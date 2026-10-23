# Hospital Management Database (DA2)

This directory contains the Oracle database component for a Hospital Management Dashboard. It contains exactly 19 tables and is intentionally limited to the specified DA2 database scope.

## Prerequisites

- Oracle Database (for example Oracle XE) with a user/schema that can create tables, indexes, and procedures.
- Oracle SQL Developer or SQL*Plus.

## Execution order

Run the files in this exact order while connected to the target Oracle schema:

1. `01_schema.sql` — creates the 19 tables.
2. `02_constraints.sql` — adds all data-integrity constraints.
3. `03_indexes.sql` — adds non-duplicate performance indexes.
4. `04_seed_data.sql` — inserts demonstration data and commits it.
5. `05_queries.sql` — runs predefined academic SELECT statements.
6. `06_plsql.sql` — compiles three demonstration procedures.
7. `07_sequences.sql` — creates the sequences used by the Spring Boot backend for new primary-key values.

In SQL*Plus, from this directory, use:

```sql
@01_schema.sql
@02_constraints.sql
@03_indexes.sql
@04_seed_data.sql
@05_queries.sql
@06_plsql.sql
@07_sequences.sql
```

For output from `show_patient_consultations`, run `SET SERVEROUTPUT ON` before calling it.

## Table list

`PATIENT`, `PATIENT_PHONE`, `FEEDBACK`, `MEDICAL_RECORD`, `DOCTOR`, `DOCTOR_PHONE`, `DOCTOR_QUALIFICATION`, `DOCTOR_RATING`, `DOCTOR_SPECIALIZATION`, `HOSPITAL`, `HOSPITAL_PHONE`, `HOSPITAL_DOCTOR`, `CONSULTATION`, `PAYMENT`, `PRESCRIPTION`, `MEDICINE`, `PRESCRIPTION_MEDICINE`, `TEST`, and `PRESCRIPTION_TEST`.

## Important integrity rules

- Primary keys identify each main entity; composite primary keys model phone numbers, qualifications, and prescription items.
- Foreign keys preserve parent-child relationships, such as a consultation referring to an existing patient and doctor.
- `DOCTOR_RATING` and `DOCTOR_SPECIALIZATION` each use `DOCTOR_ID` as both primary key and foreign key, enforcing one row per doctor.
- Check constraints restrict genders, ratings, specializations, modes, payment methods, medicine types, and test types to the required values.
- `LICENSE_NO` is unique, while required names, dates, and status-related fields are `NOT NULL`.

## Verification queries

After setup, use these checks:

```sql
-- Must return 19.
SELECT COUNT(*) AS table_count
FROM user_tables
WHERE table_name IN (
    'PATIENT', 'PATIENT_PHONE', 'FEEDBACK', 'MEDICAL_RECORD', 'DOCTOR',
    'DOCTOR_PHONE', 'DOCTOR_QUALIFICATION', 'DOCTOR_RATING',
    'DOCTOR_SPECIALIZATION', 'HOSPITAL', 'HOSPITAL_PHONE',
    'HOSPITAL_DOCTOR', 'CONSULTATION', 'PAYMENT', 'PRESCRIPTION',
    'MEDICINE', 'PRESCRIPTION_MEDICINE', 'TEST', 'PRESCRIPTION_TEST'
);

SELECT table_name, constraint_name, constraint_type
FROM user_constraints
WHERE table_name IN ('PATIENT', 'DOCTOR', 'CONSULTATION', 'PAYMENT')
ORDER BY table_name, constraint_type;

SELECT object_name, object_type, status
FROM user_objects
WHERE object_type = 'PROCEDURE'
ORDER BY object_name;
```

To demonstrate constraint enforcement, try an invalid value in a transaction, observe the Oracle error, then issue `ROLLBACK`:

```sql
INSERT INTO doctor_rating (doctor_id, rating) VALUES (101, 6);
ROLLBACK;
```
