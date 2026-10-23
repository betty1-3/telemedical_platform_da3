package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.Patient;
import com.hospital.dashboard.model.graph.GraphModels.GraphNode;
import com.hospital.dashboard.service.GraphService;
import com.hospital.dashboard.service.OracleGraphSyncService;
import com.hospital.dashboard.service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GraphControllerCrudTest {
    private RecordingPatientService patients;
    private GraphController controller;

    @BeforeEach
    void setUp() {
        patients = new RecordingPatientService();
        OracleGraphSyncService sync = new OracleGraphSyncService(null, null) {
            @Override public void ensureGraphAvailable() { }
        };
        controller = new GraphController(new GraphService(null), patients, sync);
    }

    @Test
    void graphCreateUsesOracleGeneratedId() {
        GraphNode node = controller.createPatientNode(new Patient());

        assertEquals("Patient:901", node.id());
        assertEquals(1, patients.createCalls);
    }

    @Test
    void graphUpdateWritesThroughToOracle() {
        controller.updatePatientNode(901L, new Patient());

        assertEquals(901L, patients.updatedId);
    }

    @Test
    void graphDeleteWritesThroughToOracle() {
        controller.deletePatientNode(901L);
        assertEquals(901L, patients.deletedId);
    }

    private static final class RecordingPatientService extends PatientService {
        private int createCalls;
        private Long updatedId;
        private Long deletedId;

        private RecordingPatientService() { super(null); }

        @Override public Patient create(Patient patient) {
            createCalls++;
            patient.setPatientId(901L);
            return patient;
        }

        @Override public Patient getById(Long id) { return new Patient(); }

        @Override public Patient update(Long id, Patient patient) {
            updatedId = id;
            patient.setPatientId(id);
            return patient;
        }

        @Override public void delete(Long id) { deletedId = id; }
    }
}
