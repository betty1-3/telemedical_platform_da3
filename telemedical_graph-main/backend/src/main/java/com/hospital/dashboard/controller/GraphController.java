package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.graph.GraphModels.DoctorDiscovery;
import com.hospital.dashboard.model.graph.GraphModels.GraphData;
import com.hospital.dashboard.model.graph.GraphModels.GraphHealth;
import com.hospital.dashboard.model.graph.GraphModels.GraphNode;
import com.hospital.dashboard.model.graph.GraphModels.PatientJourneyItem;
import com.hospital.dashboard.model.graph.GraphModels.Referral;
import com.hospital.dashboard.model.graph.GraphModels.ReferralPath;
import com.hospital.dashboard.service.GraphService;
import com.hospital.dashboard.service.PatientService;
import com.hospital.dashboard.service.OracleGraphSyncService;
import com.hospital.dashboard.model.Patient;
import com.hospital.dashboard.config.SkipGraphRefresh;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import java.util.Map;

import java.util.List;

/** Graph reads plus patient writes routed through Oracle and projected to Neo4j. */
@RestController
@RequestMapping("/api/graph")
public class GraphController {

    private final GraphService service;
    private final PatientService patientService;
    private final OracleGraphSyncService oracleGraphSync;

    public GraphController(GraphService service, PatientService patientService, OracleGraphSyncService oracleGraphSync) {
        this.service = service;
        this.patientService = patientService;
        this.oracleGraphSync = oracleGraphSync;
    }

    @GetMapping("/health")
    public GraphHealth health() { return service.health(); }

    @GetMapping("/patients/{patientId}")
    public GraphNode patientNode(@PathVariable Long patientId) { return service.patientNode(patientId); }

    @PostMapping("/sync")
    @SkipGraphRefresh
    public Map<String, Object> refreshFromOracle() {
        oracleGraphSync.refresh();
        GraphHealth health = service.health();
        return Map.of("status", "synchronized", "nodeCount", health.nodeCount(), "database", health.database());
    }

    @PostMapping("/patients")
    @ResponseStatus(HttpStatus.CREATED)
    public GraphNode createPatientNode(@org.springframework.web.bind.annotation.RequestBody Patient patient) {
        oracleGraphSync.ensureGraphAvailable();
        Patient created = patientService.create(patient);
        return patientGraphNode(created);
    }

    @PutMapping("/patients/{patientId}")
    public GraphNode updatePatientNode(@PathVariable Long patientId,
                                       @org.springframework.web.bind.annotation.RequestBody Patient patient) {
        oracleGraphSync.ensureGraphAvailable();
        Patient current = patientService.getById(patientId);
        if (patient.getGender() == null) patient.setGender(current.getGender());
        if (patient.getArea() == null) patient.setArea(current.getArea());
        if (patient.getPincode() == null) patient.setPincode(current.getPincode());
        Patient updated = patientService.update(patientId, patient);
        return patientGraphNode(updated);
    }

    @DeleteMapping("/patients/{patientId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePatientNode(@PathVariable Long patientId) {
        oracleGraphSync.ensureGraphAvailable();
        patientService.delete(patientId);
    }

    private GraphNode patientGraphNode(Patient patient) {
        return new GraphNode("Patient:" + patient.getPatientId(), "Patient", "Patient #" + patient.getPatientId());
    }

    @GetMapping("/doctors")
    public List<DoctorDiscovery> discoverDoctors(
            @RequestParam String specialization,
            @RequestParam(required = false) Long excludeDoctorId) {
        return service.discoverDoctors(specialization, excludeDoctorId);
    }

    @GetMapping("/patients/{patientId}/journey")
    public List<PatientJourneyItem> patientJourney(@PathVariable Long patientId) {
        return service.patientJourney(patientId);
    }

    @GetMapping("/referrals/{doctorId}")
    public List<Referral> outgoingReferrals(@PathVariable Long doctorId) {
        return service.outgoingReferrals(doctorId);
    }

    @GetMapping("/referrals/path")
    public List<ReferralPath> referralPaths(
            @RequestParam Long fromDoctorId,
            @RequestParam Long toDoctorId,
            @RequestParam(defaultValue = "3") Integer maxDepth) {
        return service.referralPaths(fromDoctorId, toDoctorId, maxDepth);
    }

    @GetMapping("/visualization")
    public GraphData visualization(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(defaultValue = "24") Integer maxNodes) {
        return service.visualization(patientId, doctorId, maxNodes);
    }
}
