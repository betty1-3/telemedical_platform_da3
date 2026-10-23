# Hospital Management Dashboard — Backend (DA2)

Spring Boot + Spring JDBC (JdbcTemplate) REST backend for the Hospital
Management Dashboard mini-project. This covers **DA2 only**: SQL/PL-SQL
implementation is already done in `database/`, and this backend exposes it
over REST. There is deliberately **no authentication, no login/register, and
no DA3 query window** — see the project scope notes below.

> **Read `SCHEMA_ASSUMPTIONS.md` first.** It documents the actual Oracle schema,
> REST field names, ID generation, and the supporting-table relationships used
> by the frontend.

---

## 1. Folder structure

```
backend/
├── pom.xml
├── SCHEMA_ASSUMPTIONS.md
├── README.md
└── src/main/
    ├── java/com/hospital/dashboard/
    │   ├── HospitalDashboardApplication.java   # main() / Spring Boot entry point
    │   ├── config/
    │   │   └── WebCorsConfig.java              # CORS for the local frontend
    │   ├── model/                              # POJOs (one per core table) + DashboardSummary
    │   ├── repository/                         # JdbcTemplate SQL, one class per table/topic
    │   ├── service/                             # validation + business logic
    │   ├── controller/                         # REST endpoints (@RestController)
    │   └── exception/                          # custom exceptions + GlobalExceptionHandler
    └── resources/
        └── application.properties              # env-var driven DB config, CORS origin
```

Two styles are used on purpose:

- **Core tables** (Patient, Doctor, Hospital, Consultation, Payment,
  Prescription, Medicine, Test) get a full `Model + Repository + Service +
  Controller` per table, with typed fields and full validation. These are
  the tables with real business rules (consultation mode, rating ranges,
  experience >= 0, etc.).
- **The 11 simpler supporting tables** (phone numbers, qualifications,
  doctor ratings, specializations, feedback, medical records, and the
  many-to-many link tables) share one generic `GenericTableRepository` that
  works with `Map<String,Object>` rows keyed by the exact Oracle column
  name. This avoids writing ten near-identical POJOs for tables that are
  just a few columns each — every query still goes through JdbcTemplate
  with bound parameters, so it's equally safe from SQL injection.

## 2. How Oracle JDBC connectivity works

- `spring-boot-starter-jdbc` auto-configures a `DataSource` (HikariCP pool)
  from the three properties in `application.properties`:
  `spring.datasource.url`, `.username`, `.password`.
- Those three properties are themselves pulled from **environment
  variables** (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`) using Spring's
  `${VAR:default}` placeholder syntax — `DB_URL` defaults to
  `jdbc:oracle:thin:@localhost:1521/FREEPDB1` if not set, but
  `DB_USERNAME`/`DB_PASSWORD` have no default and must be supplied, so
  nothing is ever hardcoded or committed.
- `oracle.jdbc.OracleDriver` (from the `ojdbc11` dependency in `pom.xml`) is
  the actual JDBC driver Oracle understands.
- Spring wires that `DataSource` into a single shared `JdbcTemplate` bean,
  which every repository class receives via constructor injection.

## 3. How JdbcTemplate is used

`JdbcTemplate` is Spring's thin wrapper around raw JDBC. The repositories use
parameterized SQL for values and explicit Oracle sequences for new surrogate IDs.
The sequence script is `database/07_sequences.sql`.

For example, a typed repository obtains an ID with `SEQ_PATIENT.NEXTVAL` and
then inserts that ID explicitly. Supporting tables without surrogate IDs use
their actual composite or foreign-key keys.

`GenericTableRepository` uses `NamedParameterJdbcTemplate` for the supporting
tables and uses the configured sequence when an endpoint inserts into a table
with a surrogate key such as `FEEDBACK` or `MEDICAL_RECORD`.

## 4. Main API endpoints

**Core CRUD** (all under `/api/...`, JSON in/out):

| Resource | Endpoints |
|---|---|
| Patients | `GET/POST /api/patients`, `GET/PUT/DELETE /api/patients/{id}` |
| Doctors | `GET/POST /api/doctors`, `GET/PUT/DELETE /api/doctors/{id}` |
| Hospitals | `GET/POST /api/hospitals`, `GET/PUT/DELETE /api/hospitals/{id}` |
| Consultations | `GET/POST /api/consultations`, `GET/PUT/DELETE /api/consultations/{id}` |
| Payments | `GET/POST /api/payments`, `GET/PUT/DELETE /api/payments/{id}` |
| Prescriptions | `GET/POST /api/prescriptions`, `GET/PUT/DELETE /api/prescriptions/{id}` |
| Medicines | `GET/POST /api/medicines`, `GET/PUT/DELETE /api/medicines/{id}` |
| Tests | `GET/POST /api/tests`, `GET/PUT/DELETE /api/tests/{id}` |

**Supporting tables** (Map-based JSON using the exact Oracle column names):

| Table | Base path | Notes |
|---|---|---|
| `FEEDBACK` | `/api/feedback` | `+ /patient/{patientId}`; validates `rating` 1–5 |
| `MEDICAL_RECORD` | `/api/medical-records` | `+ /patient/{patientId}`; id column is `medical_record_id` |
| `DOCTOR_QUALIFICATION` | `/api/doctor-qualifications` | no surrogate key; `+ /doctor/{doctorId}`; `DELETE ?doctorId=&qualification=` |
| `DOCTOR_RATING` | `/api/doctor-ratings` | no surrogate key; `+ /doctor/{doctorId}`; validates `rating` 1–5; `DELETE ?doctorId=&rating=` |
| `DOCTOR_SPECIALIZATION` | `/api/doctor-specializations` | no surrogate key; `+ /doctor/{doctorId}`; `DELETE ?doctorId=&specialization=` |
| `PATIENT_PHONE` | `/api/patient-phones` | composite key; `DELETE ?patientId=&phoneNo=` |
| `DOCTOR_PHONE` | `/api/doctor-phones` | composite key; `DELETE ?doctorId=&phoneNo=` |
| `HOSPITAL_PHONE` | `/api/hospital-phones` | composite key; column is `contact_no`; `DELETE ?hospitalId=&contactNo=` |
| `HOSPITAL_DOCTOR` | `/api/hospital-doctors` | composite key; `DELETE ?hospitalId=&doctorId=`; optional `role` column |
| `PRESCRIPTION_MEDICINE` | `/api/prescription-medicines` | composite key; `DELETE ?prescriptionId=&medicineId=` |
| `PRESCRIPTION_TEST` | `/api/prescription-tests` | composite key; `DELETE ?prescriptionId=&testId=` |

**Dashboard** (all computed live from Oracle, nothing hardcoded):

- `GET /api/dashboard/summary` — totals: patients, doctors, hospitals, consultations, prescriptions, payments, revenue
- `GET /api/dashboard/consultations-by-status`
- `GET /api/dashboard/patients-by-city`
- `GET /api/dashboard/doctors-by-specialization`
- `GET /api/dashboard/payment-summary`

## 5. feedback_comment and consultation_mode → Oracle mapping

Oracle 26ai reserves `COMMENT` and `MODE`, so:

- `FEEDBACK` uses the real column `feedback_comment`. The JSON body can use
  either `feedback_comment` or `feedbackComment` depending on how you name
  the map key when calling the API — since `FeedbackController` works on a
  raw `Map<String,Object>`, whatever key you send is passed straight
  through to the column of the same name, so **send `feedback_comment`
  exactly** (matching the Oracle column) in your request body.
- `CONSULTATION` uses the real column `consultation_mode`. Unlike
  `FEEDBACK`, `Consultation` is a typed POJO, so the JSON field is the
  clean camelCase `consultationMode`; `ConsultationRepository` maps it to
  `consultation_mode` in every SQL statement.
- The Oracle column `"Date"` (quoted, reserved-word-adjacent) is exposed to
  the frontend as the clean JSON field `date`, and `ConsultationRepository`
  is the only place that ever writes the literal string `"Date"` (with
  quotes) into SQL — every statement there uses it exactly as
  `\"Date\"`, never bare `Date`.

## 6. Constraint / error handling

The database keeps its own constraints (PK, FK, UNIQUE, CHECK, NOT NULL) —
the backend does not try to duplicate all of them. `GlobalExceptionHandler`
catches `DataIntegrityViolationException`, inspects the underlying Oracle
error code, and returns a clean JSON error instead of a stack trace:

| Situation | Oracle error | HTTP status |
|---|---|---|
| Duplicate PK / unique value (e.g. license number) | ORA-00001 | 409 Conflict |
| Insert references a non-existent parent row | ORA-02291 | 400 Bad Request |
| Delete blocked by a dependent child row | ORA-02292 | 409 Conflict |
| CHECK constraint violated (e.g. bad consultation mode) | ORA-02290 | 400 Bad Request |
| Required column left NULL | ORA-01400 | 400 Bad Request |
| Record not found by id | — | 404 Not Found |
| Missing/invalid request field caught before hitting the DB | — | 400 Bad Request |
| Anything else unexpected | — | 500 Internal Server Error |

## 7. Running the backend

Requirements: JDK 17+, Maven 3.8+, Oracle Database Free (26ai) running
locally with the database scripts, including `07_sequences.sql`, already executed.

```bash
cd backend

# set the required environment variables (adjust as needed)
export DB_URL="jdbc:oracle:thin:@localhost:1521/FREEPDB1"
export DB_USERNAME="C##STUDENT"
export DB_PASSWORD="your_password_here"
export FRONTEND_ORIGIN="http://localhost:5500"   # your frontend's local dev origin

mvn clean install
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

> This environment could not run `mvn clean install` against Maven Central
> (no network access) or against a live Oracle instance, so the build/tests
> below are documented for you to run locally rather than reported as
> already verified here.

## 8. Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `DB_URL` | No | `jdbc:oracle:thin:@localhost:1521/FREEPDB1` | Oracle JDBC URL |
| `DB_USERNAME` | **Yes** | — | Oracle username (e.g. `C##STUDENT`) |
| `DB_PASSWORD` | **Yes** | — | Oracle password |
| `FRONTEND_ORIGIN` | No | `http://localhost:5500` | Allowed CORS origin for the frontend |

## 9. API testing examples

```bash
# 1. Patients
curl http://localhost:8080/api/patients
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Asha","lastName":"Rao","dob":"1990-04-12","gender":"F","city":"Chennai","area":"T Nagar","pincode":"600017"}'
curl -X PUT http://localhost:8080/api/patients/1 -H "Content-Type: application/json" -d '{...same shape...}'
curl -X DELETE http://localhost:8080/api/patients/1

# 2. Doctors / Hospitals / Consultations (same GET/POST/PUT/DELETE shape)
curl http://localhost:8080/api/doctors
curl http://localhost:8080/api/hospitals
curl http://localhost:8080/api/consultations

# 3. Consultation with consultation_mode + "Date"
curl -X POST http://localhost:8080/api/consultations \
  -H "Content-Type: application/json" \
  -d '{"patientId":1,"doctorId":1,"bookingDate":"2026-09-01","date":"2026-09-05","startTime":"10:00","endTime":"10:30","status":"SCHEDULED","consultationMode":"VIDEO"}'

# 4. Feedback using feedback_comment
curl -X POST http://localhost:8080/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"patient_id":1,"feedback_comment":"Great experience","rating":5}'

# 5. Payment using payment_amount + paidBy (no payment_date/payment_status)
curl -X POST http://localhost:8080/api/payments \
  -H "Content-Type: application/json" \
  -d '{"consultationId":1,"amount":500.00,"paidBy":"UPI"}'

# 6. Prescription using p_date (JSON: prescriptionDate) + dosage (no doctorId/patientId)
curl -X POST http://localhost:8080/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{"consultationId":1,"prescriptionDate":"2026-09-05","dosage":"1 tablet twice daily"}'

# 7. Phone/no-key supporting tables use the exact Oracle column name as the JSON key
curl -X POST http://localhost:8080/api/patient-phones \
  -H "Content-Type: application/json" -d '{"patient_id":1,"phone_no":"9840012345"}'
curl -X DELETE "http://localhost:8080/api/patient-phones?patientId=1&phoneNo=9840012345"
curl -X POST http://localhost:8080/api/doctor-ratings \
  -H "Content-Type: application/json" -d '{"doctor_id":1,"rating":5}'

# 8. Dashboard
curl http://localhost:8080/api/dashboard/summary
curl http://localhost:8080/api/dashboard/consultations-by-status
curl http://localhost:8080/api/dashboard/patients-by-city
curl http://localhost:8080/api/dashboard/doctors-by-specialization
curl http://localhost:8080/api/dashboard/payment-summary
```

### Verification checklist (from the assignment)

1. Oracle connection works → app starts without a `DataSource` error.
2. `GET /api/patients` works.
3. `POST /api/patients` works.
4. `PUT /api/patients/{id}` works.
5. `DELETE /api/patients/{id}` works.
6. `GET /api/doctors` works.
7. `GET /api/hospitals` works.
8. `GET /api/consultations` works.
9. `GET /api/dashboard/summary` works.
10. Feedback works using `feedback_comment` (not `comment`).
11. Consultation works using `consultation_mode` (not `mode`) and `"Date"`.

## 10. Strict scope boundaries respected

- No authentication, login/register, JWT, or session handling.
- No DA3 query window, SQL console, or arbitrary-SQL endpoint.
- No new tables — all 19 existing tables only.
- No hardcoded records, IDs, or dashboard numbers — every response is a
  live query result.
- The frontend uses the REST contract documented in `SCHEMA_ASSUMPTIONS.md`;
  phone, specialization, and prescription junction data are stored through
  their dedicated supporting-table endpoints.
