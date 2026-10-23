package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.Prescription;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class PrescriptionRepository {

    private final JdbcTemplate jdbcTemplate;

    public PrescriptionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String SELECT_ALL = "SELECT prescription_id, consultation_id, p_date, dosage FROM prescription";

    private static final RowMapper<Prescription> ROW_MAPPER = (rs, rowNum) -> {
        Prescription p = new Prescription();
        p.setPrescriptionId(rs.getLong("prescription_id"));
        p.setConsultationId(rs.getLong("consultation_id"));
        p.setPrescriptionDate(rs.getDate("p_date") != null ? rs.getDate("p_date").toLocalDate() : null);
        p.setDosage(rs.getString("dosage"));
        return p;
    };

    public List<Prescription> findAll() {
        return jdbcTemplate.query(SELECT_ALL + " ORDER BY prescription_id", ROW_MAPPER);
    }

    public Optional<Prescription> findById(Long id) {
        Optional<Prescription> opt = jdbcTemplate.query(SELECT_ALL + " WHERE prescription_id = ?", ROW_MAPPER, id).stream().findFirst();
        opt.ifPresent(this::populateRelatedData);
        return opt;
    }

    private void populateRelatedData(Prescription p) {
        Long id = p.getPrescriptionId();
        // Medicines
        List<Long> medicineIds = jdbcTemplate.query(
                "SELECT medicine_id FROM prescription_medicine WHERE prescription_id = ? ORDER BY medicine_id",
                (rs, rowNum) -> rs.getLong("medicine_id"), id);
        p.setMedicineIds(medicineIds);

        // Tests
        List<Long> testIds = jdbcTemplate.query(
                "SELECT test_id FROM prescription_test WHERE prescription_id = ? ORDER BY test_id",
                (rs, rowNum) -> rs.getLong("test_id"), id);
        p.setTestIds(testIds);
    }

    public Prescription save(Prescription p) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_prescription.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO prescription (prescription_id, consultation_id, p_date, dosage) VALUES (?, ?, ?, ?)");
            ps.setLong(1, id);
            ps.setLong(2, p.getConsultationId());
            ps.setDate(3, p.getPrescriptionDate() != null ? Date.valueOf(p.getPrescriptionDate()) : null);
            ps.setString(4, p.getDosage());
            return ps;
        });
        p.setPrescriptionId(id);

        saveChildRecords(id, p);
        return p;
    }

    public int update(Long id, Prescription p) {
        int rows = jdbcTemplate.update(
                "UPDATE prescription SET consultation_id = ?, p_date = ?, dosage = ? WHERE prescription_id = ?",
                p.getConsultationId(),
                p.getPrescriptionDate() != null ? Date.valueOf(p.getPrescriptionDate()) : null,
                p.getDosage(), id);

        updateChildRecords(id, p);
        return rows;
    }

    private void saveChildRecords(Long prescriptionId, Prescription p) {
        if (p.getMedicineIds() != null) {
            Set<Long> seen = new HashSet<>();
            for (Long medId : p.getMedicineIds()) {
                if (medId != null && seen.add(medId)) {
                    jdbcTemplate.update("INSERT INTO prescription_medicine (prescription_id, medicine_id) VALUES (?, ?)",
                            prescriptionId, medId);
                }
            }
        }

        if (p.getTestIds() != null) {
            Set<Long> seen = new HashSet<>();
            for (Long testId : p.getTestIds()) {
                if (testId != null && seen.add(testId)) {
                    jdbcTemplate.update("INSERT INTO prescription_test (prescription_id, test_id) VALUES (?, ?)",
                            prescriptionId, testId);
                }
            }
        }
    }

    private void updateChildRecords(Long prescriptionId, Prescription p) {
        if (p.getMedicineIds() != null) {
            jdbcTemplate.update("DELETE FROM prescription_medicine WHERE prescription_id = ?", prescriptionId);
            Set<Long> seen = new HashSet<>();
            for (Long medId : p.getMedicineIds()) {
                if (medId != null && seen.add(medId)) {
                    jdbcTemplate.update("INSERT INTO prescription_medicine (prescription_id, medicine_id) VALUES (?, ?)",
                            prescriptionId, medId);
                }
            }
        }

        if (p.getTestIds() != null) {
            jdbcTemplate.update("DELETE FROM prescription_test WHERE prescription_id = ?", prescriptionId);
            Set<Long> seen = new HashSet<>();
            for (Long testId : p.getTestIds()) {
                if (testId != null && seen.add(testId)) {
                    jdbcTemplate.update("INSERT INTO prescription_test (prescription_id, test_id) VALUES (?, ?)",
                            prescriptionId, testId);
                }
            }
        }
    }

    public int deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM prescription_medicine WHERE prescription_id = ?", id);
        jdbcTemplate.update("DELETE FROM prescription_test WHERE prescription_id = ?", id);
        return jdbcTemplate.update("DELETE FROM prescription WHERE prescription_id = ?", id);
    }
}
