package com.hospital.dashboard.repository.graph;

import com.hospital.dashboard.exception.GraphUnavailableException;
import com.hospital.dashboard.exception.ConflictException;
import com.hospital.dashboard.model.graph.GraphModels.DoctorDiscovery;
import com.hospital.dashboard.model.graph.GraphModels.GraphData;
import com.hospital.dashboard.model.graph.GraphModels.GraphHealth;
import com.hospital.dashboard.model.graph.GraphModels.GraphNode;
import com.hospital.dashboard.model.graph.GraphModels.GraphRelationship;
import com.hospital.dashboard.model.graph.GraphModels.PatientJourneyItem;
import com.hospital.dashboard.model.graph.OracleGraphSnapshot;
import com.hospital.dashboard.model.graph.GraphModels.Referral;
import com.hospital.dashboard.model.graph.GraphModels.ReferralPath;
import org.neo4j.driver.Driver;
import org.neo4j.driver.Record;
import org.neo4j.driver.Result;
import org.neo4j.driver.Session;
import org.neo4j.driver.SessionConfig;
import org.neo4j.driver.TransactionContext;
import org.neo4j.driver.Value;
import org.neo4j.driver.exceptions.Neo4jException;
import org.neo4j.driver.types.Node;
import org.neo4j.driver.types.Relationship;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

/**
 * Parameterized Cypher access only. This repository never reads or writes the
 * Oracle datasource and is deliberately separate from the JdbcTemplate repositories.
 */
@Repository
public class Neo4jGraphRepository {

    private final ObjectProvider<Driver> driverProvider;
    private final String database;

    public Neo4jGraphRepository(ObjectProvider<Driver> driverProvider,
                                @org.springframework.beans.factory.annotation.Value("${app.neo4j.database}") String database) {
        this.driverProvider = driverProvider;
        this.database = database;
    }

    public boolean patientExists(Long patientId) {
        return nodeExists("Patient", "patientId", patientId);
    }

    public GraphNode findPatientNode(Long id) {
        return read(session -> session.run("MATCH (p:Patient {patientId: $id}) RETURN p",
                Map.of("id", id)).list(record -> addNode(new LinkedHashMap<>(), record.get("p").asNode())).stream().findFirst().orElse(null));
    }

    public boolean doctorExists(Long doctorId) {
        return nodeExists("Doctor", "doctorId", doctorId);
    }

    public GraphHealth health() {
        Driver driver = driverProvider.getIfAvailable();
        if (driver == null) throw new GraphUnavailableException("Healthcare Graph is disabled. Set NEO4J_ENABLED=true and configure Neo4j credentials.");
        try {
            driver.verifyConnectivity();
            try (Session session = driver.session(SessionConfig.forDatabase(database))) {
                long count = session.run("MATCH (n) RETURN count(n) AS nodeCount").single().get("nodeCount").asLong();
                return new GraphHealth(true, count, database);
            }
        } catch (Neo4jException | IllegalStateException ex) {
            throw new GraphUnavailableException("Healthcare Graph is unavailable. Verify the Neo4j URI, credentials, database, and that the instance is running.", ex);
        }
    }

    /** Upserts Oracle-owned nodes, rebuilds only source-backed relationships, and removes stale Oracle-owned nodes. */
    public void synchronizeOracleProjection(OracleGraphSnapshot graphData) {
        Driver driver = driverProvider.getIfAvailable();
        if (driver == null) throw new GraphUnavailableException("Neo4j synchronization is disabled. Set NEO4J_ENABLED=true.");
        try (Session session = driver.session(SessionConfig.forDatabase(database))) {
            session.executeWrite(tx -> {
                mergeNodes(tx, "Patient", "patientId", graphData.patients());
                mergeNodes(tx, "Doctor", "doctorId", graphData.doctors());
                mergeNodes(tx, "Hospital", "hospitalId", graphData.hospitals());
                mergeNodes(tx, "Appointment", "appointmentId", graphData.consultations());
                mergeNodes(tx, "Specialization", "code", graphData.specializations());
                mergeNodes(tx, "Prescription", "prescriptionId", graphData.prescriptions());
                mergeNodes(tx, "Medicine", "medicineId", graphData.medicines());
                mergeNodes(tx, "Test", "testId", graphData.tests());
                tx.run("MATCH (n) WHERE n.sourceSystem='DEMO' DETACH DELETE n").consume();

                for (String type : List.of("BOOKED", "WITH", "SPECIALIZES_IN", "AFFILIATED_WITH",
                        "HAS_PRESCRIPTION", "PRESCRIBES", "ORDERS_TEST", "CONSULTED")) {
                    tx.run("MATCH ()-[r:`" + type + "`]-() DELETE r").consume();
                }

                deleteStale(tx, "Patient", "patientId", graphData.patients());
                deleteStale(tx, "Doctor", "doctorId", graphData.doctors());
                deleteStale(tx, "Hospital", "hospitalId", graphData.hospitals());
                deleteStale(tx, "Appointment", "appointmentId", graphData.consultations());
                deleteStale(tx, "Specialization", "code", graphData.specializations());
                deleteStale(tx, "Prescription", "prescriptionId", graphData.prescriptions());
                deleteStale(tx, "Medicine", "medicineId", graphData.medicines());
                deleteStale(tx, "Test", "testId", graphData.tests());

                mergeRelationships(tx, "MATCH (a:Patient {patientId: row.patientId}), (b:Appointment {appointmentId: row.appointmentId}) MERGE (a)-[r:BOOKED]->(b) SET r.sourceSystem='ORACLE'", graphData.bookings());
                mergeRelationships(tx, "MATCH (a:Appointment {appointmentId: row.appointmentId}), (b:Doctor {doctorId: row.doctorId}) MERGE (a)-[r:`WITH`]->(b) SET r.sourceSystem='ORACLE'", graphData.consultationDoctors());
                mergeRelationships(tx, "MATCH (a:Doctor {doctorId: row.doctorId}), (b:Specialization {code: row.code}) MERGE (a)-[r:SPECIALIZES_IN]->(b) SET r.sourceSystem='ORACLE'", graphData.doctorSpecializations());
                mergeRelationships(tx, "MATCH (a:Doctor {doctorId: row.doctorId}), (b:Hospital {hospitalId: row.hospitalId}) MERGE (a)-[r:AFFILIATED_WITH]->(b) SET r.role=row.role, r.sourceSystem='ORACLE'", graphData.affiliations());
                mergeRelationships(tx, "MATCH (a:Appointment {appointmentId: row.appointmentId}), (b:Prescription {prescriptionId: row.prescriptionId}) MERGE (a)-[r:HAS_PRESCRIPTION]->(b) SET r.sourceSystem='ORACLE'", graphData.consultationPrescriptions());
                mergeRelationships(tx, "MATCH (a:Prescription {prescriptionId: row.prescriptionId}), (b:Medicine {medicineId: row.medicineId}) MERGE (a)-[r:PRESCRIBES]->(b) SET r.sourceSystem='ORACLE'", graphData.prescriptionMedicines());
                mergeRelationships(tx, "MATCH (a:Prescription {prescriptionId: row.prescriptionId}), (b:Test {testId: row.testId}) MERGE (a)-[r:ORDERS_TEST]->(b) SET r.sourceSystem='ORACLE'", graphData.prescriptionTests());

                List<Map<String, Object>> completed = graphData.consultations().stream()
                        .filter(row -> "COMPLETED".equalsIgnoreCase(String.valueOf(row.get("status")))
                                && row.get("patientId") != null && row.get("doctorId") != null)
                        .map(row -> Map.<String, Object>of("patientId", row.get("patientId"),
                                "doctorId", row.get("doctorId"), "appointmentId", row.get("appointmentId")))
                        .toList();
                mergeRelationships(tx, "MATCH (a:Patient {patientId: row.patientId}), (b:Doctor {doctorId: row.doctorId}) MERGE (a)-[r:CONSULTED {appointmentId: row.appointmentId}]->(b) SET r.sourceSystem='ORACLE'", completed);
                return null;
            });
        } catch (Neo4jException | IllegalStateException ex) {
            throw new GraphUnavailableException("Neo4j refresh failed. The Oracle change may already be committed; retry POST /api/graph/sync.", ex);
        }
    }

    private void mergeNodes(TransactionContext tx, String label, String key, List<Map<String, Object>> rows) {
        tx.run("UNWIND $rows AS row MERGE (n:" + label + " {" + key + ": row." + key + "}) " +
                        "SET n += row, n.sourceSystem='ORACLE', n.synthetic=false",
                Map.of("rows", rows)).consume();
    }

    private void deleteStale(TransactionContext tx, String label, String key, List<Map<String, Object>> rows) {
        List<Object> ids = rows.stream().map(row -> row.get(key)).filter(java.util.Objects::nonNull).toList();
        tx.run("MATCH (n:" + label + ") WHERE n.sourceSystem='ORACLE' AND NOT n." + key + " IN $ids DETACH DELETE n",
                Map.of("ids", ids)).consume();
    }

    private void mergeRelationships(TransactionContext tx, String pattern, List<Map<String, Object>> rows) {
        if (!rows.isEmpty()) tx.run("UNWIND $rows AS row " + pattern, Map.of("rows", rows)).consume();
    }

    public List<DoctorDiscovery> findDoctorsBySpecialization(String specialization, Long excludeDoctorId) {
        String cypher = """
                MATCH (doctor:Doctor)-[:SPECIALIZES_IN]->(specialization:Specialization {code: $specialization})
                WHERE $excludeDoctorId IS NULL OR doctor.doctorId <> $excludeDoctorId
                RETURN DISTINCT doctor.doctorId AS doctorId,
                       doctor.name AS doctorName,
                       specialization.name AS specialization
                ORDER BY doctorName
                """;
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("specialization", specialization);
        parameters.put("excludeDoctorId", excludeDoctorId);
        return read(session -> session.run(cypher, parameters).list(record -> new DoctorDiscovery(
                record.get("doctorId").asLong(),
                stringValue(record.get("doctorName")),
                stringValue(record.get("specialization"))
        )));
    }

    public List<PatientJourneyItem> findPatientJourney(Long patientId) {
        String cypher = """
                MATCH (patient:Patient {patientId: $patientId})-[:BOOKED]->(appointment:Appointment)-[:`WITH`]->(doctor:Doctor)
                OPTIONAL MATCH (patient)-[consulted:CONSULTED {appointmentId: appointment.appointmentId}]->(doctor)
                RETURN appointment.appointmentId AS appointmentId,
                       appointment.appointmentDate AS appointmentDate,
                       appointment.status AS status,
                       appointment.mode AS mode,
                       doctor.doctorId AS doctorId,
                       doctor.name AS doctorName,
                       consulted IS NOT NULL AS consulted
                ORDER BY appointmentDate, appointmentId
                """;
        return read(session -> session.run(cypher, Map.of("patientId", patientId)).list(record -> new PatientJourneyItem(
                record.get("appointmentId").asLong(),
                dateValue(record.get("appointmentDate")),
                stringValue(record.get("status")),
                stringValue(record.get("mode")),
                record.get("doctorId").asLong(),
                stringValue(record.get("doctorName")),
                record.get("consulted").asBoolean()
        )));
    }

    public List<Referral> findOutgoingReferrals(Long doctorId) {
        String cypher = """
                MATCH (source:Doctor {doctorId: $doctorId})-[referral:REFERRED_TO]->(target:Doctor)
                RETURN source.doctorId AS fromDoctorId,
                       source.name AS fromDoctorName,
                       target.doctorId AS toDoctorId,
                       target.name AS toDoctorName,
                       referral.reason AS reason,
                       referral.referredOn AS referredOn,
                       referral.synthetic AS synthetic
                ORDER BY referredOn, toDoctorName
                """;
        return read(session -> session.run(cypher, Map.of("doctorId", doctorId)).list(this::toReferral));
    }

    public List<ReferralPath> findReferralPaths(Long fromDoctorId, Long toDoctorId, int maxDepth) {
        String cypher = """
                MATCH path = (source:Doctor {doctorId: $fromDoctorId})-[:REFERRED_TO*1..5]->(target:Doctor {doctorId: $toDoctorId})
                WHERE length(path) <= $maxDepth
                RETURN nodes(path) AS doctors, relationships(path) AS referrals
                LIMIT 10
                """;
        Map<String, Object> parameters = Map.of(
                "fromDoctorId", fromDoctorId,
                "toDoctorId", toDoctorId,
                "maxDepth", maxDepth
        );
        return read(session -> session.run(cypher, parameters).list(this::toReferralPath));
    }

    public GraphData patientGraph(Long patientId, int maxNodes) {
        String cypher = """
                MATCH (patient:Patient {patientId: $patientId})-[booked:BOOKED]->(appointment:Appointment)-[withRelation:`WITH`]->(doctor:Doctor)
                OPTIONAL MATCH (doctor)-[specializes:SPECIALIZES_IN]->(specialization:Specialization)
                OPTIONAL MATCH (doctor)-[affiliation:AFFILIATED_WITH]->(hospital:Hospital)
                OPTIONAL MATCH (appointment)-[hasPrescription:HAS_PRESCRIPTION]->(prescription:Prescription)
                OPTIONAL MATCH (prescription)-[prescribes:PRESCRIBES]->(medicine:Medicine)
                OPTIONAL MATCH (prescription)-[ordersTest:ORDERS_TEST]->(test:Test)
                OPTIONAL MATCH (patient)-[consulted:CONSULTED {appointmentId: appointment.appointmentId}]->(doctor)
                RETURN patient, appointment, doctor, specialization, hospital, prescription, medicine, test,
                       booked, withRelation, specializes, affiliation, hasPrescription, prescribes, ordersTest, consulted
                ORDER BY appointment.appointmentDate, appointment.appointmentId
                LIMIT $rowLimit
                """;
        List<Record> records = read(session -> session.run(cypher, Map.of(
                "patientId", patientId,
                "rowLimit", maxNodes
        )).list());
        return graphFromPatientRecords(records, maxNodes);
    }

    public GraphData doctorReferralGraph(Long doctorId, int maxNodes) {
        String cypher = """
                MATCH (doctor:Doctor {doctorId: $doctorId})
                OPTIONAL MATCH (doctor)-[outgoing:REFERRED_TO]->(outgoingDoctor:Doctor)
                OPTIONAL MATCH (incomingDoctor:Doctor)-[incoming:REFERRED_TO]->(doctor)
                OPTIONAL MATCH (doctor)-[specializes:SPECIALIZES_IN]->(specialization:Specialization)
                RETURN doctor, outgoing, outgoingDoctor, incoming, incomingDoctor, specializes, specialization
                LIMIT $rowLimit
                """;
        List<Record> records = read(session -> session.run(cypher, Map.of(
                "doctorId", doctorId,
                "rowLimit", maxNodes
        )).list());
        return graphFromDoctorRecords(records, maxNodes);
    }

    private boolean nodeExists(String label, String idProperty, Long id) {
        String cypher = "MATCH (node:" + label + " {" + idProperty + ": $id}) RETURN count(node) > 0 AS exists";
        return read(session -> session.run(cypher, Map.of("id", id)).single().get("exists").asBoolean());
    }

    private <T> T read(Function<Session, T> work) {
        Driver driver = driverProvider.getIfAvailable();
        if (driver == null) {
            throw new GraphUnavailableException("Healthcare Graph is disabled. Set NEO4J_ENABLED=true and configure Neo4j credentials.");
        }
        try (Session session = driver.session(SessionConfig.forDatabase(database))) {
            return work.apply(session);
        } catch (Neo4jException | IllegalStateException ex) {
            throw new GraphUnavailableException("Healthcare Graph is unavailable. Verify that Neo4j is running and its credentials are valid.", ex);
        }
    }

    private <T> T write(Function<TransactionContext, T> work) {
        Driver driver = driverProvider.getIfAvailable();
        if (driver == null) throw new GraphUnavailableException("Healthcare Graph is disabled. Set NEO4J_ENABLED=true and configure Neo4j credentials.");
        try (Session session = driver.session(SessionConfig.forDatabase(database))) {
            return session.executeWrite(work::apply);
        } catch (Neo4jException ex) {
            if (ex.code() != null && ex.code().startsWith("Neo.ClientError.Schema.Constraint")) {
                throw new ConflictException("A graph node with this identifier already exists.");
            }
            throw new GraphUnavailableException("Healthcare Graph operation failed. Verify the graph instance and constraints.", ex);
        } catch (IllegalStateException ex) {
            throw new GraphUnavailableException("Healthcare Graph operation failed. Verify the graph instance and constraints.", ex);
        }
    }

    private Referral toReferral(Record record) {
        return new Referral(
                record.get("fromDoctorId").asLong(),
                stringValue(record.get("fromDoctorName")),
                record.get("toDoctorId").asLong(),
                stringValue(record.get("toDoctorName")),
                stringValue(record.get("reason")),
                dateValue(record.get("referredOn")),
                booleanValue(record.get("synthetic"))
        );
    }

    private ReferralPath toReferralPath(Record record) {
        List<Node> doctors = record.get("doctors").asList(Value::asNode);
        List<Relationship> referrals = record.get("referrals").asList(Value::asRelationship);
        List<Referral> steps = new ArrayList<>();
        for (int index = 0; index < referrals.size(); index++) {
            Node from = doctors.get(index);
            Node to = doctors.get(index + 1);
            Relationship referral = referrals.get(index);
            steps.add(new Referral(
                    from.get("doctorId").asLong(),
                    stringValue(from.get("name")),
                    to.get("doctorId").asLong(),
                    stringValue(to.get("name")),
                    stringValue(referral.get("reason")),
                    dateValue(referral.get("referredOn")),
                    booleanValue(referral.get("synthetic"))
            ));
        }
        return new ReferralPath(steps);
    }

    private GraphData graphFromPatientRecords(List<Record> records, int maxNodes) {
        Map<String, GraphNode> nodes = new LinkedHashMap<>();
        Map<String, GraphRelationship> relationships = new LinkedHashMap<>();
        for (Record record : records) {
            GraphNode patient = addNode(nodes, nodeValue(record, "patient"));
            GraphNode appointment = addNode(nodes, nodeValue(record, "appointment"));
            GraphNode doctor = addNode(nodes, nodeValue(record, "doctor"));
            GraphNode specialization = addNode(nodes, nodeValue(record, "specialization"));
            GraphNode hospital = addNode(nodes, nodeValue(record, "hospital"));
            GraphNode prescription = addNode(nodes, nodeValue(record, "prescription"));
            GraphNode medicine = addNode(nodes, nodeValue(record, "medicine"));
            GraphNode test = addNode(nodes, nodeValue(record, "test"));
            addRelationship(relationships, "BOOKED", patient, appointment, "");
            addRelationship(relationships, "WITH", appointment, doctor, "");
            addRelationship(relationships, "SPECIALIZES_IN", doctor, specialization, "");
            addRelationship(relationships, "AFFILIATED_WITH", doctor, hospital, "");
            addRelationship(relationships, "HAS_PRESCRIPTION", appointment, prescription, "");
            addRelationship(relationships, "PRESCRIBES", prescription, medicine, "");
            addRelationship(relationships, "ORDERS_TEST", prescription, test, "");
            if (!record.get("consulted").isNull()) {
                addRelationship(relationships, "CONSULTED", patient, doctor,
                        String.valueOf(record.get("appointment").asNode().get("appointmentId").asLong()));
            }
        }
        return boundedGraph(nodes, relationships, maxNodes);
    }

    private GraphData graphFromDoctorRecords(List<Record> records, int maxNodes) {
        Map<String, GraphNode> nodes = new LinkedHashMap<>();
        Map<String, GraphRelationship> relationships = new LinkedHashMap<>();
        for (Record record : records) {
            GraphNode doctor = addNode(nodes, nodeValue(record, "doctor"));
            GraphNode outgoingDoctor = addNode(nodes, nodeValue(record, "outgoingDoctor"));
            GraphNode incomingDoctor = addNode(nodes, nodeValue(record, "incomingDoctor"));
            GraphNode specialization = addNode(nodes, nodeValue(record, "specialization"));
            addRelationship(relationships, "REFERRED_TO", doctor, outgoingDoctor, "outgoing");
            addRelationship(relationships, "REFERRED_TO", incomingDoctor, doctor, "incoming");
            addRelationship(relationships, "SPECIALIZES_IN", doctor, specialization, "");
        }
        return boundedGraph(nodes, relationships, maxNodes);
    }

    private GraphData boundedGraph(Map<String, GraphNode> nodeMap,
                                   Map<String, GraphRelationship> relationshipMap,
                                   int maxNodes) {
        List<GraphNode> nodes = nodeMap.values().stream().limit(maxNodes).toList();
        Map<String, Boolean> retainedNodeIds = new LinkedHashMap<>();
        nodes.forEach(node -> retainedNodeIds.put(node.id(), true));
        List<GraphRelationship> relationships = relationshipMap.values().stream()
                .filter(relationship -> retainedNodeIds.containsKey(relationship.source())
                        && retainedNodeIds.containsKey(relationship.target()))
                .toList();
        return new GraphData(nodes, relationships);
    }

    private GraphNode addNode(Map<String, GraphNode> nodes, Node node) {
        if (node == null) return null;
        String type = node.labels().iterator().next();
        String id = switch (type) {
            case "Patient" -> "Patient:" + node.get("patientId").asLong();
            case "Doctor" -> "Doctor:" + node.get("doctorId").asLong();
            case "Appointment" -> "Appointment:" + node.get("appointmentId").asLong();
            case "Specialization" -> "Specialization:" + stringValue(node.get("code"));
            case "Hospital" -> "Hospital:" + node.get("hospitalId").asLong();
            case "Prescription" -> "Prescription:" + node.get("prescriptionId").asLong();
            case "Medicine" -> "Medicine:" + node.get("medicineId").asLong();
            case "Test" -> "Test:" + node.get("testId").asLong();
            default -> type + ":" + node.elementId();
        };
        String label = switch (type) {
            case "Patient" -> "Patient #" + node.get("patientId").asLong();
            case "Doctor" -> stringValue(node.get("name"));
            case "Appointment" -> "Appointment #" + node.get("appointmentId").asLong();
            case "Specialization" -> stringValue(node.get("name"));
            case "Hospital" -> stringValue(node.get("name"));
            case "Prescription" -> "Prescription #" + node.get("prescriptionId").asLong();
            case "Medicine" -> stringValue(node.get("name"));
            case "Test" -> stringValue(node.get("name"));
            default -> type;
        };
        GraphNode graphNode = new GraphNode(id, type, label);
        nodes.putIfAbsent(id, graphNode);
        return graphNode;
    }

    private void addRelationship(Map<String, GraphRelationship> relationships,
                                 String type,
                                 GraphNode source,
                                 GraphNode target,
                                 String suffix) {
        if (source == null || target == null) return;
        String id = type + ":" + source.id() + ":" + target.id() + ":" + suffix;
        relationships.putIfAbsent(id, new GraphRelationship(id, type, source.id(), target.id()));
    }

    private Node nodeValue(Record record, String key) {
        Value value = record.get(key);
        return value == null || value.isNull() ? null : value.asNode();
    }

    private static String stringValue(Value value) {
        return value == null || value.isNull() ? null : value.asString();
    }

    private static String dateValue(Value value) {
        return value == null || value.isNull() ? null : value.asLocalDate().toString();
    }

    private static boolean booleanValue(Value value) {
        return value != null && !value.isNull() && value.asBoolean();
    }
}
