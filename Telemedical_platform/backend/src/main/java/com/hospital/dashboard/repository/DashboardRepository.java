package com.hospital.dashboard.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * All dashboard numbers are computed live from Oracle with plain SQL
 * aggregate queries (COUNT, SUM, GROUP BY) - nothing here is hardcoded.
 */
@Repository
public class DashboardRepository {

    private final JdbcTemplate jdbcTemplate;

    public DashboardRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public long countPatients() {
        return count("SELECT COUNT(*) FROM patient");
    }

    public long countDoctors() {
        return count("SELECT COUNT(*) FROM doctor");
    }

    public long countHospitals() {
        return count("SELECT COUNT(*) FROM hospital");
    }

    public long countConsultations() {
        return count("SELECT COUNT(*) FROM consultation");
    }

    public long countPrescriptions() {
        return count("SELECT COUNT(*) FROM prescription");
    }

    public long countPayments() {
        return count("SELECT COUNT(*) FROM payment");
    }

    public BigDecimal totalRevenue() {
        BigDecimal total = jdbcTemplate.queryForObject(
                "SELECT NVL(SUM(payment_amount), 0) FROM payment", BigDecimal.class);
        return total != null ? total : BigDecimal.ZERO;
    }

    public List<Map<String, Object>> consultationsByStatus() {
        return jdbcTemplate.queryForList(
                "SELECT status, COUNT(*) AS total FROM consultation GROUP BY status ORDER BY status");
    }

    public List<Map<String, Object>> patientsByCity() {
        return jdbcTemplate.queryForList(
                "SELECT city, COUNT(*) AS total FROM patient GROUP BY city ORDER BY total DESC");
    }

    public List<Map<String, Object>> doctorsBySpecialization() {
        return jdbcTemplate.queryForList(
                "SELECT specialization, COUNT(*) AS total FROM doctor_specialization " +
                        "GROUP BY specialization ORDER BY total DESC");
    }

    public List<Map<String, Object>> paymentSummaryByMethod() {
        // Real schema has no "payment_method" column - grouping by paid_by instead.
        return jdbcTemplate.queryForList(
                "SELECT paid_by, COUNT(*) AS total_payments, NVL(SUM(payment_amount), 0) AS total_amount " +
                        "FROM payment GROUP BY paid_by ORDER BY total_amount DESC");
    }

    private long count(String sql) {
        Long result = jdbcTemplate.queryForObject(sql, Long.class);
        return result != null ? result : 0L;
    }
}
