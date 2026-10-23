package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.FeedbackDto;
import com.hospital.dashboard.model.MedicalRecordDto;
import com.hospital.dashboard.model.Patient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class PatientRepository {

    private final JdbcTemplate jdbcTemplate;

    public PatientRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<Patient> ROW_MAPPER = (rs, rowNum) -> {
        Patient p = new Patient();
        p.setPatientId(rs.getLong("patient_id"));
        p.setFirstName(rs.getString("first_name"));
        p.setLastName(rs.getString("last_name"));
        p.setDob(rs.getDate("dob") != null ? rs.getDate("dob").toLocalDate() : null);
        p.setGender(rs.getString("gender"));
        p.setCity(rs.getString("city"));
        p.setArea(rs.getString("area"));
        p.setPincode(rs.getString("pincode"));
        return p;
    };

    public List<Patient> findAll() {
        return jdbcTemplate.query("SELECT * FROM patient ORDER BY patient_id", ROW_MAPPER);
    }

    public Optional<Patient> findById(Long id) {
        Optional<Patient> opt = jdbcTemplate.query("SELECT * FROM patient WHERE patient_id = ?", ROW_MAPPER, id).stream().findFirst();
        opt.ifPresent(this::populateRelatedData);
        return opt;
    }

    private void populateRelatedData(Patient p) {
        Long id = p.getPatientId();
        // Phones
        List<String> phones = jdbcTemplate.query(
                "SELECT phone_no FROM patient_phone WHERE patient_id = ? ORDER BY phone_no",
                (rs, rowNum) -> rs.getString("phone_no"), id);
        p.setPhones(phones);

        // Medical Records
        List<MedicalRecordDto> records = jdbcTemplate.query(
                "SELECT medical_record_id, symptoms, diagnoses FROM medical_record WHERE patient_id = ? ORDER BY medical_record_id",
                (rs, rowNum) -> new MedicalRecordDto(rs.getLong("medical_record_id"), rs.getString("symptoms"), rs.getString("diagnoses")), id);
        p.setMedicalRecords(records);

        // Feedback
        List<FeedbackDto> feedbacks = jdbcTemplate.query(
                "SELECT feedback_id, feedback_comment, rating FROM feedback WHERE patient_id = ? ORDER BY feedback_id",
                (rs, rowNum) -> new FeedbackDto(rs.getLong("feedback_id"), rs.getString("feedback_comment"), rs.getInt("rating")), id);
        p.setFeedbacks(feedbacks);
    }

    public Patient save(Patient p) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_patient.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO patient (patient_id, first_name, last_name, dob, gender, city, area, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            ps.setLong(1, id);
            ps.setString(2, p.getFirstName());
            ps.setString(3, p.getLastName());
            ps.setDate(4, p.getDob() != null ? java.sql.Date.valueOf(p.getDob()) : null);
            ps.setString(5, p.getGender());
            ps.setString(6, p.getCity());
            ps.setString(7, p.getArea());
            ps.setString(8, p.getPincode());
            return ps;
        });
        p.setPatientId(id);

        saveChildRecords(id, p);
        return p;
    }

    public int update(Long id, Patient p) {
        int rows = jdbcTemplate.update(
                "UPDATE patient SET first_name = ?, last_name = ?, dob = ?, gender = ?, city = ?, area = ?, pincode = ? WHERE patient_id = ?",
                p.getFirstName(), p.getLastName(),
                p.getDob() != null ? java.sql.Date.valueOf(p.getDob()) : null,
                p.getGender(), p.getCity(), p.getArea(), p.getPincode(), id);

        updateChildRecords(id, p);
        return rows;
    }

    private void saveChildRecords(Long patientId, Patient p) {
        if (p.getPhones() != null) {
            Set<String> seen = new HashSet<>();
            for (String phone : p.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String clean = phone.trim();
                    if (seen.add(clean)) {
                        jdbcTemplate.update("INSERT INTO patient_phone (patient_id, phone_no) VALUES (?, ?)", patientId, clean);
                    }
                }
            }
        }

        if (p.getMedicalRecords() != null) {
            for (MedicalRecordDto rec : p.getMedicalRecords()) {
                if (rec != null && (rec.getSymptoms() != null || rec.getDiagnoses() != null)) {
                    Long recId = jdbcTemplate.queryForObject("SELECT seq_medical_record.NEXTVAL FROM dual", Long.class);
                    jdbcTemplate.update(
                            "INSERT INTO medical_record (medical_record_id, patient_id, symptoms, diagnoses) VALUES (?, ?, ?, ?)",
                            recId, patientId, rec.getSymptoms(), rec.getDiagnoses());
                    rec.setMedicalRecordId(recId);
                }
            }
        }

        if (p.getFeedbacks() != null) {
            for (FeedbackDto fb : p.getFeedbacks()) {
                if (fb != null && (fb.getFeedbackComment() != null || fb.getRating() != null)) {
                    Long fbId = jdbcTemplate.queryForObject("SELECT seq_feedback.NEXTVAL FROM dual", Long.class);
                    jdbcTemplate.update(
                            "INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating) VALUES (?, ?, ?, ?)",
                            fbId, patientId, fb.getFeedbackComment(), fb.getRating());
                    fb.setFeedbackId(fbId);
                }
            }
        }
    }

    private void updateChildRecords(Long patientId, Patient p) {
        if (p.getPhones() != null) {
            jdbcTemplate.update("DELETE FROM patient_phone WHERE patient_id = ?", patientId);
            Set<String> seen = new HashSet<>();
            for (String phone : p.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String clean = phone.trim();
                    if (seen.add(clean)) {
                        jdbcTemplate.update("INSERT INTO patient_phone (patient_id, phone_no) VALUES (?, ?)", patientId, clean);
                    }
                }
            }
        }

        if (p.getMedicalRecords() != null) {
            jdbcTemplate.update("DELETE FROM medical_record WHERE patient_id = ?", patientId);
            for (MedicalRecordDto rec : p.getMedicalRecords()) {
                if (rec != null && (rec.getSymptoms() != null || rec.getDiagnoses() != null)) {
                    Long recId = jdbcTemplate.queryForObject("SELECT seq_medical_record.NEXTVAL FROM dual", Long.class);
                    jdbcTemplate.update(
                            "INSERT INTO medical_record (medical_record_id, patient_id, symptoms, diagnoses) VALUES (?, ?, ?, ?)",
                            recId, patientId, rec.getSymptoms(), rec.getDiagnoses());
                    rec.setMedicalRecordId(recId);
                }
            }
        }

        if (p.getFeedbacks() != null) {
            jdbcTemplate.update("DELETE FROM feedback WHERE patient_id = ?", patientId);
            for (FeedbackDto fb : p.getFeedbacks()) {
                if (fb != null && (fb.getFeedbackComment() != null || fb.getRating() != null)) {
                    Long fbId = jdbcTemplate.queryForObject("SELECT seq_feedback.NEXTVAL FROM dual", Long.class);
                    jdbcTemplate.update(
                            "INSERT INTO feedback (feedback_id, patient_id, feedback_comment, rating) VALUES (?, ?, ?, ?)",
                            fbId, patientId, fb.getFeedbackComment(), fb.getRating());
                    fb.setFeedbackId(fbId);
                }
            }
        }
    }

    public int deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM patient_phone WHERE patient_id = ?", id);
        jdbcTemplate.update("DELETE FROM medical_record WHERE patient_id = ?", id);
        jdbcTemplate.update("DELETE FROM feedback WHERE patient_id = ?", id);
        return jdbcTemplate.update("DELETE FROM patient WHERE patient_id = ?", id);
    }
}
