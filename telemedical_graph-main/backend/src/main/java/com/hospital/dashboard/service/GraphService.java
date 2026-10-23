package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.graph.GraphModels.DoctorDiscovery;
import com.hospital.dashboard.model.graph.GraphModels.GraphData;
import com.hospital.dashboard.model.graph.GraphModels.GraphHealth;
import com.hospital.dashboard.model.graph.GraphModels.GraphNode;
import com.hospital.dashboard.model.graph.GraphModels.PatientJourneyItem;
import com.hospital.dashboard.model.graph.GraphModels.Referral;
import com.hospital.dashboard.model.graph.GraphModels.ReferralPath;
import com.hospital.dashboard.repository.graph.Neo4jGraphRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/** Application-level validation and missing-node handling for graph requests. */
@Service
public class GraphService {

    private static final int MAX_PATH_DEPTH = 5;
    private static final int MAX_GRAPH_NODES = 50;

    private final Neo4jGraphRepository repository;

    public GraphService(Neo4jGraphRepository repository) {
        this.repository = repository;
    }

    public GraphHealth health() { return repository.health(); }

    public GraphNode patientNode(Long id) {
        validatePositiveId(id, "patientId");
        GraphNode node = repository.findPatientNode(id);
        if (node == null) throw new ResourceNotFoundException("Patient graph node not found.");
        return node;
    }

    public List<DoctorDiscovery> discoverDoctors(String specialization, Long excludeDoctorId) {
        if (specialization == null || specialization.isBlank() || specialization.trim().length() > 50) {
            throw new InvalidRequestException("specialization is required and must be at most 50 characters");
        }
        if (excludeDoctorId != null) validatePositiveId(excludeDoctorId, "excludeDoctorId");
        return repository.findDoctorsBySpecialization(specialization.trim().toUpperCase(Locale.ROOT), excludeDoctorId);
    }

    public List<PatientJourneyItem> patientJourney(Long patientId) {
        validatePositiveId(patientId, "patientId");
        if (!repository.patientExists(patientId)) {
            throw new ResourceNotFoundException("No graph record exists for patient " + patientId + ". Seed or synchronize Neo4j first.");
        }
        return repository.findPatientJourney(patientId);
    }

    public List<Referral> outgoingReferrals(Long doctorId) {
        requireGraphDoctor(doctorId);
        return repository.findOutgoingReferrals(doctorId);
    }

    public List<ReferralPath> referralPaths(Long fromDoctorId, Long toDoctorId, Integer maxDepth) {
        requireGraphDoctor(fromDoctorId);
        requireGraphDoctor(toDoctorId);
        int depth = validateDepth(maxDepth);
        return repository.findReferralPaths(fromDoctorId, toDoctorId, depth);
    }

    public GraphData visualization(Long patientId, Long doctorId, Integer maxNodes) {
        if ((patientId == null && doctorId == null) || (patientId != null && doctorId != null)) {
            throw new InvalidRequestException("Provide exactly one of patientId or doctorId");
        }
        int limit = validateGraphLimit(maxNodes);
        if (patientId != null) {
            validatePositiveId(patientId, "patientId");
            if (!repository.patientExists(patientId)) {
                throw new ResourceNotFoundException("No graph record exists for patient " + patientId + ". Seed or synchronize Neo4j first.");
            }
            return repository.patientGraph(patientId, limit);
        }
        requireGraphDoctor(doctorId);
        return repository.doctorReferralGraph(doctorId, limit);
    }

    private void requireGraphDoctor(Long doctorId) {
        validatePositiveId(doctorId, "doctorId");
        if (!repository.doctorExists(doctorId)) {
            throw new ResourceNotFoundException("No graph record exists for doctor " + doctorId + ". Seed or synchronize Neo4j first.");
        }
    }

    private void validatePositiveId(Long id, String parameter) {
        if (id == null || id <= 0) throw new InvalidRequestException(parameter + " must be a positive number");
    }

    private int validateDepth(Integer maxDepth) {
        int depth = maxDepth == null ? 3 : maxDepth;
        if (depth < 1 || depth > MAX_PATH_DEPTH) {
            throw new InvalidRequestException("maxDepth must be between 1 and " + MAX_PATH_DEPTH);
        }
        return depth;
    }

    private int validateGraphLimit(Integer maxNodes) {
        int limit = maxNodes == null ? 24 : maxNodes;
        if (limit < 1 || limit > MAX_GRAPH_NODES) {
            throw new InvalidRequestException("maxNodes must be between 1 and " + MAX_GRAPH_NODES);
        }
        return limit;
    }
}
