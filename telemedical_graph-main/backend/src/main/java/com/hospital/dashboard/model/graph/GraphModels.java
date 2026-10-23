package com.hospital.dashboard.model.graph;

import java.util.List;

/** Small API-only DTOs for the Neo4j feature; they do not map Oracle tables. */
public final class GraphModels {

    private GraphModels() { }

    public record DoctorDiscovery(Long doctorId, String name, String specialization) { }

    public record PatientJourneyItem(
            Long appointmentId,
            String appointmentDate,
            String status,
            String mode,
            Long doctorId,
            String doctorName,
            boolean consulted) { }

    public record Referral(
            Long fromDoctorId,
            String fromDoctorName,
            Long toDoctorId,
            String toDoctorName,
            String reason,
            String referredOn,
            boolean synthetic) { }

    public record ReferralPath(List<Referral> steps) { }

    public record GraphNode(String id, String type, String label) { }

    public record GraphRelationship(String id, String type, String source, String target) { }

    public record GraphData(List<GraphNode> nodes, List<GraphRelationship> relationships) { }

    public record GraphHealth(boolean connected, long nodeCount, String database) { }

}
