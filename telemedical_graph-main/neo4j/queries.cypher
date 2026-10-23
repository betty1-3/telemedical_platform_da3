// Run after constraints.cypher and seed.cypher. All sample identifiers below
// are from database/04_seed_data.sql and are synthetic demonstration rows.

// 1. Patient 1 consultation history with clinician and date.
MATCH (p:Patient {patientId: 1})-[:BOOKED]->(c:Appointment)-[:`WITH`]->(d:Doctor)
RETURN p.patientId AS patientId, c.appointmentId AS consultationId,
       c.appointmentDate AS date, c.status AS status, d.name AS doctor
ORDER BY date;

// 2. Patients and their connected doctors.
MATCH (p:Patient)-[:BOOKED]->(:Appointment)-[:`WITH`]->(d:Doctor)
RETURN DISTINCT p.patientId AS patientId, d.doctorId AS doctorId, d.name AS doctor
ORDER BY patientId, doctorId;

// 3. Doctors and their supported HOSPITAL_DOCTOR affiliations.
MATCH (d:Doctor)-[a:AFFILIATED_WITH]->(h:Hospital)
RETURN d.name AS doctor, h.name AS hospital, a.role AS role
ORDER BY doctor, hospital;

// 4. Patient to doctor to hospital traversal (patient 1).
MATCH (p:Patient {patientId: 1})-[:BOOKED]->(:Appointment)-[:`WITH`]->(d:Doctor)-[:AFFILIATED_WITH]->(h:Hospital)
RETURN DISTINCT p.patientId AS patientId, d.name AS doctor, h.name AS hospital;

// 5. Doctor specialization discovery.
MATCH (d:Doctor)-[:SPECIALIZES_IN]->(s:Specialization {code: 'CARDIOLOGIST'})
RETURN d.doctorId AS doctorId, d.name AS doctor, s.name AS specialization;

// 6. Referral paths are synthetic graph-only prototype records, not Oracle facts.
MATCH path=(a:Doctor {doctorId: 101})-[:REFERRED_TO*1..3]->(b:Doctor {doctorId: 105})
RETURN [n IN nodes(path) | n.name] AS doctors,
       [r IN relationships(path) | r.reason] AS reasons;

// 7. Prescription to medicine traversal (prescription 901).
MATCH (p:Prescription {prescriptionId: 901})-[:PRESCRIBES]->(m:Medicine)
RETURN p.prescriptionId AS prescriptionId, m.medicineId AS medicineId, m.name AS medicine;

// 8. Prescription to diagnostic tests (prescription 901).
MATCH (p:Prescription {prescriptionId: 901})-[:ORDERS_TEST]->(t:Test)
RETURN p.prescriptionId AS prescriptionId, t.testId AS testId, t.name AS test;

// 9. Consultations without a linked prescription (includes scheduled/cancelled rows).
MATCH (c:Appointment)
WHERE NOT (c)-[:HAS_PRESCRIPTION]->(:Prescription)
RETURN c.appointmentId AS consultationId, c.status AS status, c.appointmentDate AS date
ORDER BY consultationId;

// 10a. Node counts by label.
MATCH (n) UNWIND labels(n) AS label
RETURN label, count(*) AS nodeCount ORDER BY label;

// 10b. Relationship counts by type.
MATCH ()-[r]->() RETURN type(r) AS relationshipType, count(*) AS relationshipCount
ORDER BY relationshipType;

// 11. CRUD examples use a dedicated, synthetic demo patient id outside the seed range.
// Create (unique constraint protects duplicate identifiers).
MERGE (p:Patient {patientId: 9001})
ON CREATE SET p.city = 'Demo City', p.synthetic = true, p.crudDemo = true
RETURN p;

// Read.
MATCH (p:Patient {patientId: 9001}) RETURN p;

// Update.
MATCH (p:Patient {patientId: 9001}) SET p.city = 'Updated Demo City' RETURN p;

// Delete only the explicitly identified demo patient; related edges are detached.
MATCH (p:Patient {patientId: 9001}) DETACH DELETE p;
