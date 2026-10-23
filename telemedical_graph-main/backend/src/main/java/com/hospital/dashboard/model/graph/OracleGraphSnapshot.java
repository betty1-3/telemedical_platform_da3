package com.hospital.dashboard.model.graph;

import java.util.List;
import java.util.Map;

/** A bounded set of Oracle rows and foreign-key edges for the Neo4j projection. */
public record OracleGraphSnapshot(
        List<Map<String, Object>> patients,
        List<Map<String, Object>> doctors,
        List<Map<String, Object>> hospitals,
        List<Map<String, Object>> consultations,
        List<Map<String, Object>> specializations,
        List<Map<String, Object>> prescriptions,
        List<Map<String, Object>> medicines,
        List<Map<String, Object>> tests,
        List<Map<String, Object>> bookings,
        List<Map<String, Object>> consultationDoctors,
        List<Map<String, Object>> doctorSpecializations,
        List<Map<String, Object>> affiliations,
        List<Map<String, Object>> consultationPrescriptions,
        List<Map<String, Object>> prescriptionMedicines,
        List<Map<String, Object>> prescriptionTests) { }
