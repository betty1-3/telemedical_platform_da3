# MediCore — Telemedical Management System & Healthcare Graph

A database management system project combining a traditional relational database with a graph database to manage healthcare records and explore relationships between patients, doctors, hospitals, and medical services.

The project demonstrates how **Oracle Database and Neo4j can complement each other** in a healthcare management application.

## 📌 Projects Overview

This repository contains two related projects:

### Project 1 — Hospital Management System

A web-based hospital management dashboard built around Oracle Database. It manages structured healthcare records and supports data retrieval through SQL queries.

**Key features**
- Dashboard with operational summaries and charts.
- Patient management.
- Doctor and specialization management.
- Hospital management.
- Consultation management.
- Prescription management.
- Medicine and medical test management.
- Payment tracking.
- Relational data integrity using constraints, relationships, and sequences.
- Backend database operations using Spring JDBC and `JdbcTemplate`.

### Project 2 — Healthcare Graph Extension

An extension of the hospital management application that uses Neo4j to represent healthcare entities and their relationships as a graph.

**Key features**
- Healthcare graph visualization in the frontend.
- Patient journey exploration.
- Doctor discovery through graph relationships.
- Hospital and specialization relationships.
- Prescription, medicine, and test entities where represented in the graph model.
- Graph queries using Cypher.
- Patient graph-node create, read, update, and delete operations, subject to the API's supported operations.
- Graph health endpoint for checking Neo4j connectivity.
- Uniqueness constraints and graph seed scripts.

The graph extension also demonstrates how connected data can be explored differently from relational data.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot, Maven |
| Relational database | Oracle Database |
| Graph database | Neo4j |
| Relational database access | Spring JDBC, `JdbcTemplate`, Oracle JDBC Driver |
| Graph database access | Neo4j Java Driver |
| Relational queries | SQL |
| Graph queries | Cypher |
| API communication | REST APIs |

## 🏗️ Architecture

The application uses two databases for different data requirements.

```text
                    MediCore Frontend
                 React + TypeScript + Vite
                            |
                       REST APIs
                            |
                     Spring Boot Backend
                       /            \
                      /              \
             Oracle JDBC          Neo4j Driver
                  /                    \
                 /                      \
        Oracle Database              Neo4j
        Relational Data             Graph Data
                 |                      |
         SQL queries and          Cypher queries
         structured records       nodes and relationships
```

### Oracle Database

Oracle is used for the original hospital management system. It stores structured records in relational tables and enforces data integrity using primary keys, foreign keys, constraints, indexes, and sequences.

### Neo4j Graph Database

Neo4j represents healthcare entities as nodes and their connections as relationships. This structure supports graph-based queries such as patient journeys, doctor discovery, and relationship exploration.

**Important:** Oracle and Neo4j are separate databases. Automatic synchronization between them is not implemented by default. Data present in one database should not be assumed to exist in the other.

## 🗄️ Database Design

### Oracle relational schema

The original project includes tables for:

- **Patients:** `PATIENT`, `PATIENT_PHONE`
- **Doctors:** `DOCTOR`, `DOCTOR_PHONE`, `DOCTOR_QUALIFICATION`, `DOCTOR_RATING`, `DOCTOR_SPECIALIZATION`
- **Hospitals:** `HOSPITAL`, `HOSPITAL_PHONE`, `HOSPITAL_DOCTOR`
- **Clinical records:** `MEDICAL_RECORD`, `CONSULTATION`, `PRESCRIPTION`
- **Medicines and tests:** `MEDICINE`, `PRESCRIPTION_MEDICINE`, `TEST`, `PRESCRIPTION_TEST`
- **Billing and feedback:** `PAYMENT`, `FEEDBACK`

The SQL scripts also provide schema setup, constraints, indexes, sample data, academic queries, procedures, and sequences.

### Neo4j graph model

The graph extension models healthcare entities as nodes connected by typed relationships.

Examples of graph entities include:

- `Patient`
- `Doctor`
- `Hospital`
- `Specialization`
- `Appointment`
- `Prescription`
- `Medicine`
- `Test`

The original graph model includes relationships such as:

- `BOOKED`
- `WITH`
- `SPECIALIZES_IN`
- `CONSULTED`
- `REFERRED_TO`

The exact relationships available depend on the graph schema and seed data. Referral relationships are synthetic demonstration data and should not be interpreted as actual clinical referrals.

## 📁 Repository Structure

```text
repository/
│
├── Project1/
│   ├── frontend/
│   ├── backend/
│   └── sql/
│       ├── 01_schema.sql
│       ├── 02_constraints.sql
│       ├── 03_indexes.sql
│       ├── 04_seed_data.sql
│       ├── 05_queries.sql
│       ├── 06_procedures.sql
│       └── 07_sequences.sql
│
├── Project2/
│   ├── frontend/
│   ├── backend/
│   └── neo4j/
│       ├── constraints.cypher
│       ├── seed.cypher
│       ├── queries.cypher
│       └── README.md
│
└── README.md
```

*Adjust the folder names and SQL directory path to match your actual repository. The two projects can retain their own frontend and backend folders.*

## ⚙️ Prerequisites

Install the following before running the applications:

- Java Development Kit (JDK) 21.
- Maven.
- Node.js and npm.
- Oracle Database with the required PDB available.
- Neo4j Desktop or another compatible Neo4j instance.
- Git.

## 🚀 Getting Started

### 1. Configure Oracle Database

Start your Oracle database and ensure the `FREEPDB1` pluggable database is accessible.

Run the project's SQL scripts in the appropriate order to create the schema, constraints, indexes, sample records, procedures, and sequences.

Configure the backend environment variables:

```powershell
$env:DB_URL="jdbc:oracle:thin:@localhost:1521/FREEPDB1"
$env:DB_USERNAME="YOUR_ORACLE_USERNAME"
$env:DB_PASSWORD="YOUR_ORACLE_PASSWORD"
```

Use the Oracle credentials configured for your environment.

### 2. Configure Neo4j

Start your Neo4j DBMS in Neo4j Desktop and verify that the `neo4j` database is available.

Configure the graph backend:

```powershell
$env:NEO4J_ENABLED="true"
$env:NEO4J_URI="neo4j://127.0.0.1:7687"
$env:NEO4J_USERNAME="neo4j"
$env:NEO4J_PASSWORD="YOUR_NEO4J_PASSWORD"
$env:NEO4J_DATABASE="neo4j"
```

Replace the password placeholder with your configured Neo4j password.

In the Neo4j Query interface, select the correct database and execute the graph setup scripts in order:

1. `neo4j/constraints.cypher`
2. `neo4j/seed.cypher`

Use `neo4j/queries.cypher` to explore the available graph queries.

Run the scripts from the graph project's actual `neo4j` directory. If using a separate project folder, adjust the path accordingly.

### 3. Start the backend

Open a terminal in the appropriate project's `backend` directory:

```powershell
mvn spring-boot:run
```

Keep the terminal open while using the application.

Repeat this step for each project you intend to run, using its own backend configuration and port if necessary.

### 4. Start the frontend

Open another terminal in the appropriate project's `frontend` directory:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

If the frontend requires an API base URL, configure `VITE_API_URL` to point to the corresponding backend.

## 🔍 API and Graph Verification

The graph extension provides a health endpoint:

```http
GET /api/graph/health
```

A successful response should report that the graph connection is active, along with the node count and database name.

For example:

```json
{
  "connected": true,
  "nodeCount": 39,
  "database": "neo4j"
}
```

The node count is an example of a possible local state and will change as the graph data changes.

## 🧪 Testing

The project includes backend tests and frontend build/lint checks.

Run backend tests from the backend directory:

```powershell
mvn test
```

Build the frontend:

```powershell
npm run build
```

Run lint checks where configured:

```powershell
npm run lint
```

For local integration testing, verify:

- Oracle connectivity and dashboard queries.
- Patient, doctor, hospital, consultation, prescription, medicine, test, and payment operations.
- Neo4j connectivity through the health endpoint.
- Graph node and relationship creation from the seed scripts.
- Graph visualization and supported CRUD operations.
- Cypher queries in `queries.cypher`.
- Behavior when either database is unavailable.

Passing unit tests or build checks alone does not guarantee that live database integration has been verified.

## 🔐 Security Notes

- Never commit database passwords, API keys, or personal credentials.
- Keep local `.env` files and other secret configuration files out of Git.
- Use placeholder values in `.env.example` files.
- Restrict database access to authorized users and trusted applications.
- Use synthetic or anonymized healthcare data for demonstrations.
- Do not treat demonstration graph relationships as verified clinical information.

## 🎯 Learning Outcomes

This project demonstrates:

- Relational database design and normalization.
- SQL queries, joins, constraints, indexes, and sequences.
- Backend development with Java and Spring Boot.
- Database connectivity using JDBC.
- REST API development.
- Graph data modeling with nodes and relationships.
- Cypher queries and graph traversal.
- Integration of relational and graph databases in one application.
- Comparison of relational and graph-based approaches to healthcare data.

## 🔮 Future Enhancements

- Implement a controlled Oracle-to-Neo4j synchronization mechanism.
- Add synchronization status and failure handling.
- Extend graph exploration with more relationship types and query filters.
- Add role-based authorization and audit logging.
- Improve automated integration testing against live database instances.
- Add monitoring and operational health checks for both databases.

## 👥 Contributors

Add the names and contributions of your team members here.

## 📄 License

Specify the license applicable to this repository. If the project is academic work and no license has been selected, do not imply that it is released under an open-source license.
