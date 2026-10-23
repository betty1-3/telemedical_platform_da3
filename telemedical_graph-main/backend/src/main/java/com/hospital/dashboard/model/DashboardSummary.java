package com.hospital.dashboard.model;

import java.math.BigDecimal;

/** Response shape for GET /api/dashboard/summary - all values computed live from Oracle. */
public class DashboardSummary {

    private long totalPatients;
    private long totalDoctors;
    private long totalHospitals;
    private long totalConsultations;
    private long totalPrescriptions;
    private long totalPayments;
    private BigDecimal totalRevenue;

    public DashboardSummary(long totalPatients, long totalDoctors, long totalHospitals,
                             long totalConsultations, long totalPrescriptions, long totalPayments,
                             BigDecimal totalRevenue) {
        this.totalPatients = totalPatients;
        this.totalDoctors = totalDoctors;
        this.totalHospitals = totalHospitals;
        this.totalConsultations = totalConsultations;
        this.totalPrescriptions = totalPrescriptions;
        this.totalPayments = totalPayments;
        this.totalRevenue = totalRevenue;
    }

    public long getTotalPatients() { return totalPatients; }
    public long getTotalDoctors() { return totalDoctors; }
    public long getTotalHospitals() { return totalHospitals; }
    public long getTotalConsultations() { return totalConsultations; }
    public long getTotalPrescriptions() { return totalPrescriptions; }
    public long getTotalPayments() { return totalPayments; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
}
