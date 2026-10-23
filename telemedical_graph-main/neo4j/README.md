# Telemedical Graph setup and verification

This folder adds a traversal projection to the existing React/TypeScript and
Spring Boot hospital dashboard. Oracle remains the source of truth for the
relational application's records. With `NEO4J_ENABLED=true`, successful REST
mutations made through dashboard APIs are followed by a projection refresh.
Graph CRUD writes through Oracle before refreshing Neo4j. `seed.cypher`
contains clearly marked synthetic demonstration data using identifiers from
`database/04_seed_data.sql`. Direct SQL changes outside the app require
`POST /api/graph/sync`. Direct Neo4j Browser writes do not update Oracle and
may be overwritten by the next refresh.

Refresh merges nodes by Oracle primary key, rebuilds the Oracle-backed
relationships, removes stale Oracle-owned nodes, and removes unmatched nodes
tagged as seeded `DEMO` data. It preserves unrelated graph nodes and the
graph-only `REFERRED_TO` relationships when their doctor endpoints still
exist.

## Prerequisites and configuration

- Java 17 and Maven (backend; Spring Boot 3.3.4).
- Node.js and npm (frontend).
- An Oracle instance/schema initialized with `database/01_schema.sql` through
  `database/07_sequences.sql`, plus its demo data if using the dashboard.
- Neo4j Desktop with a local DBMS and database started.

Copy `.env.example` as a reference for the required settings. Spring Boot does
not load `.env` automatically: set the values in the shell or IDE run
configuration. Never commit real credentials. `.env` files are ignored by Git.

Required Oracle variables (must match the actual Oracle listener and schema):

| Variable | Value |
| --- | --- |
| `DB_URL` | JDBC URL including the actual host, listener port and service name, e.g. `jdbc:oracle:thin:@//localhost:<port>/<service>` |
| `DB_USERNAME` | Schema user that owns or can access the project's tables |
| `DB_PASSWORD` | That schema user's password |

Neo4j settings:

| Variable | Value |
| --- | --- |
| `NEO4J_ENABLED` | `true` to enable graph endpoints |
| `NEO4J_URI` | Bolt URI shown for the running DBMS in Desktop (commonly `bolt://localhost:7687`, but use the displayed value) |
| `NEO4J_USERNAME` | Database user's configured username (Desktop default is commonly `neo4j`) |
| `NEO4J_PASSWORD` | Password set for that database user |
| `NEO4J_DATABASE` | Database name selected in the DBMS (often `neo4j`) |
| `FRONTEND_ORIGIN` | Optional frontend origin, default `http://localhost:5173` |

Oracle URL, service, user, and password are intentionally not defaulted in
`application.properties`: they are installation-specific. The graph driver is
separate from Oracle `JdbcTemplate`; no cross-database transaction is used.

## Create and start Neo4j Desktop database

1. Install and open Neo4j Desktop. Create a local project and add a local DBMS.
2. Set and retain the initial password for the database user.
3. Start the DBMS, then inspect its connection details/settings in Desktop.
   Copy the actual Bolt URI and database name into `NEO4J_URI` and
   `NEO4J_DATABASE`; do not assume a port or database name.
4. Use Desktop's Open/Connect action or Neo4j Browser to connect and verify the
   selected database. The Browser URL and Bolt URI are different settings.

For a PowerShell session, set values directly (replace placeholders locally):

```powershell
$env:DB_URL = 'jdbc:oracle:thin:@//localhost:<port>/<service>'
$env:DB_USERNAME = '<schema-user>'
$env:DB_PASSWORD = '<oracle-password>'
$env:NEO4J_ENABLED = 'true'
$env:NEO4J_URI = 'bolt://localhost:<bolt-port>'
$env:NEO4J_USERNAME = 'neo4j'
$env:NEO4J_PASSWORD = '<neo4j-password>'
$env:NEO4J_DATABASE = '<database-name>'
```

## Initialize and inspect the graph

Run scripts in this order against the selected database. Neo4j Desktop's Query
interface can open each file; alternatively use `cypher-shell` bundled with
the installation and its actual Bolt address:

```powershell
cypher-shell -a $env:NEO4J_URI -u $env:NEO4J_USERNAME -d $env:NEO4J_DATABASE --file neo4j\constraints.cypher
cypher-shell -a $env:NEO4J_URI -u $env:NEO4J_USERNAME -d $env:NEO4J_DATABASE --file neo4j\seed.cypher
cypher-shell -a $env:NEO4J_URI -u $env:NEO4J_USERNAME -d $env:NEO4J_DATABASE --file neo4j\queries.cypher
```

Enter the password when prompted. Constraints must be created before the seed.
Both are repeatable: constraints use `IF NOT EXISTS`; the seed uses `MERGE`
against unique source keys and `MERGE` for relationships. It does not delete
existing graph data. Its rows represent the bundled SQL demo dataset, not
verified clinical facts.

### Graph model

| Label | Stable key | Properties in demo projection |
| --- | --- | --- |
| `Patient` | `patientId` (`PATIENT.patient_id`) | `city`, `synthetic` |
| `Doctor` | `doctorId` (`DOCTOR.doctor_id`) | `firstName`, `lastName`, `name`, `yearsExperience`, `synthetic` |
| `Appointment` | `appointmentId` (`CONSULTATION.consultation_id`) | `appointmentDate`, `status`, `mode`, `sourceEntity`, `synthetic` |
| `Specialization` | `code` (`DOCTOR_SPECIALIZATION.specialization`) | `name`, `synthetic` |
| `Hospital` | `hospitalId` (`HOSPITAL.hospital_id`) | `name`, `city`, `synthetic` |
| `Prescription` | `prescriptionId` (`PRESCRIPTION.prescription_id`) | `date`, `dosage`, `synthetic` |
| `Medicine` | `medicineId` (`MEDICINE.medicine_id`) | `name`, `type`, `synthetic` |
| `Test` | `testId` (`TEST.test_id`) | `name`, `type`, `synthetic` |

| Relationship | Source to target | Relational basis |
| --- | --- | --- |
| `BOOKED` | Patient → Appointment | `CONSULTATION.patient_id` |
| `WITH` | Appointment → Doctor | `CONSULTATION.doctor_id` |
| `CONSULTED` | Patient → Doctor | Derived convenience edge for completed consultations; carries `appointmentId` |
| `SPECIALIZES_IN` | Doctor → Specialization | `DOCTOR_SPECIALIZATION.doctor_id` |
| `AFFILIATED_WITH` | Doctor → Hospital | `HOSPITAL_DOCTOR` junction; carries `role` |
| `HAS_PRESCRIPTION` | Appointment → Prescription | `PRESCRIPTION.consultation_id` |
| `PRESCRIBES` | Prescription → Medicine | `PRESCRIPTION_MEDICINE` junction |
| `ORDERS_TEST` | Prescription → Test | `PRESCRIPTION_TEST` junction |
| `REFERRED_TO` | Doctor → Doctor | Synthetic prototype-only data; no Oracle referral table |

Uniqueness constraints are in `constraints.cypher` for each label's stable
key; those constraints provide indexes for key lookups. No extra indexes are
added where no graph query needs them.

## Start the application

With Oracle and Neo4j running and environment variables configured, use two
PowerShell windows from the repository root:

```powershell
cd backend
mvn spring-boot:run
```

```powershell
cd frontend
npm install
npm run dev
```

The frontend defaults to `http://localhost:8080/api`; set `VITE_API_URL` if
the backend is hosted elsewhere. The graph page fetches patient/doctor choices
from Oracle and graph traversal results from the backend. A relational record
can exist without a corresponding graph projection.

## Graph API

All routes are under `/api/graph`:

| Method and route | Purpose |
| --- | --- |
| `GET /health` | Verifies connectivity to configured Neo4j database and reports node count; empty graph returns connected with count 0. |
| `POST /sync` | Refresh the graph projection from Oracle after direct SQL changes. |
| `GET /doctors?specialization=CARDIOLOGIST` | Find graph doctors by specialization. Optional `excludeDoctorId`. |
| `GET /patients/{id}/journey` | Consultation history for a patient. |
| `GET /patients/{id}` | Read a Patient graph node. |
| `POST /patients` | Create a patient in Oracle and refresh Neo4j. Oracle generates the ID. Body example: `{"firstName":"Demo","lastName":"Patient","dob":"1990-01-01","city":"Demo City"}`. |
| `PUT /patients/{id}` | Update the Oracle patient and refresh its graph projection. |
| `DELETE /patients/{id}` | Delete through Oracle's referential rules, then refresh Neo4j. |
| `/crud/doctors[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for doctors; writes save to Oracle then refresh Neo4j. |
| `/crud/hospitals[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for hospitals. |
| `/crud/consultations[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for consultations. |
| `/crud/prescriptions[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for prescriptions. |
| `/crud/medicines[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for medicines. |
| `/crud/tests[/{id}]` | GET/POST/PUT/DELETE graph CRUD API for tests. |
| `GET /referrals/{doctorId}` | Direct synthetic outgoing referrals. |
| `GET /referrals/path?fromDoctorId=101&toDoctorId=105&maxDepth=3` | Directed synthetic referral paths. |
| `GET /visualization?patientId=1&maxNodes=24` | Bounded graph for a patient. Use `doctorId` instead for referral view. |

Invalid IDs/limits return 400, missing records return 404, Oracle constraint
failures use existing 400/409 responses, and disabled or unavailable Neo4j
returns 503. If an Oracle mutation succeeds but projection refresh fails, the
response says Oracle saved the change and advises retrying `POST /api/graph/sync`.
Oracle and Neo4j do not share a distributed transaction. The health response
does not expose credentials.

## Reproducible demo sequence

1. Start the configured Oracle service and run the repository's schema,
   constraints, sequences, and seed scripts if the schema is empty.
2. Start the Neo4j Desktop DBMS, set the environment variables above, and run
   `constraints.cypher`, then `seed.cypher`.
3. Start backend and frontend. Open the Healthcare Graph page.
4. Select patient 1 to view its appointments and graph. Select a specialization
   to find doctors; choose doctors to inspect referral paths.
5. In the graph CRUD panel, enter required patient fields and Create. Oracle
   generates the ID; use it for Read, Update, and Delete. Deletion may be
   rejected if Oracle records still refer to that patient.
6. Run `queries.cypher` in Neo4j Browser to inspect traversals and counts.
   CRUD statements at the end use the same demo-only ID.

## Oracle and Neo4j in this project

| Topic | Oracle relational database | Neo4j graph projection |
| --- | --- | --- |
| Data model | Rows in normalized tables such as `PATIENT`, `CONSULTATION`, and junction tables. | Labeled nodes and typed relationships using source primary keys. |
| Traversal | SQL joins connect foreign keys and junction tables. | Cypher follows patterns such as patient → consultation → doctor → hospital. |
| Constraints/indexes | PK, FK, unique/check constraints and indexes are defined in `database/02_constraints.sql` and `03_indexes.sql`. | Uniqueness constraints on stable IDs are in `constraints.cypher`; add indexes for measured query needs. |
| Consistency | Oracle is the source of truth and the existing CRUD database. | Separate projection refreshed after app API writes; no shared transaction. If refresh fails, retry the manual sync endpoint. |
| Appropriate use | Existing CRUD, relational integrity, payments, and dashboard SQL aggregates. | Connected journey exploration and multi-hop graph queries over a deliberate projection. |

No benchmark comparison is claimed. Oracle remains authoritative. Graph CRUD
routes write through Oracle and refresh Neo4j; direct database edits require
the documented manual refresh from Oracle to Neo4j.

## Troubleshooting and verification limits

- `503` from `/api/graph/health`: check `NEO4J_ENABLED`, Desktop DBMS running
  state, Bolt URI, authentication, and selected database. The response omits
  password and URI details.
- Health returns `connected: true, nodeCount: 0`: the database is reachable
  but seed data has not been loaded into that database.
- Empty patient journey / 404 node: check that the patient ID exists in the
  seeded projection and that the selected database is correct.
- Backend fails during startup: set the actual Oracle `DB_URL`, `DB_USERNAME`,
  and `DB_PASSWORD`; these are required and intentionally have no defaults.
- Browser cannot call the API: check `FRONTEND_ORIGIN`, `VITE_API_URL`, and
  that backend port 8080 is reachable.

The repository cannot claim live Neo4j connectivity until `/api/graph/health`
returns success against the user's running Desktop instance. Build/test status
should be taken from the latest verification run, not inferred from this guide.
