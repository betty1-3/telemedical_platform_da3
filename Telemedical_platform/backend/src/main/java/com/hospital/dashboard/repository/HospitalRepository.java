package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.DoctorAffiliation;
import com.hospital.dashboard.model.Hospital;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class HospitalRepository {

    private final JdbcTemplate jdbcTemplate;

    public HospitalRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<Hospital> ROW_MAPPER = (rs, rowNum) -> {
        Hospital h = new Hospital();
        h.setHospitalId(rs.getLong("hospital_id"));
        h.setHospitalName(rs.getString("name"));
        h.setStreet(rs.getString("street"));
        h.setArea(rs.getString("area"));
        h.setCity(rs.getString("city"));
        h.setPincode(rs.getString("pincode"));
        return h;
    };

    public List<Hospital> findAll() {
        return jdbcTemplate.query("SELECT * FROM hospital ORDER BY hospital_id", ROW_MAPPER);
    }

    public Optional<Hospital> findById(Long id) {
        Optional<Hospital> opt = jdbcTemplate.query("SELECT * FROM hospital WHERE hospital_id = ?", ROW_MAPPER, id).stream().findFirst();
        opt.ifPresent(this::populateRelatedData);
        return opt;
    }

    private void populateRelatedData(Hospital h) {
        Long id = h.getHospitalId();
        // Phones (column contact_no)
        List<String> phones = jdbcTemplate.query(
                "SELECT contact_no FROM hospital_phone WHERE hospital_id = ? ORDER BY contact_no",
                (rs, rowNum) -> rs.getString("contact_no"), id);
        h.setPhones(phones);

        // Doctors
        List<DoctorAffiliation> doctors = jdbcTemplate.query(
                "SELECT doctor_id, role FROM hospital_doctor WHERE hospital_id = ? ORDER BY doctor_id",
                (rs, rowNum) -> new DoctorAffiliation(rs.getLong("doctor_id"), rs.getString("role")), id);
        h.setDoctors(doctors);
    }

    public Hospital save(Hospital h) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_hospital.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO hospital (hospital_id, name, street, area, city, pincode) VALUES (?, ?, ?, ?, ?, ?)");
            ps.setLong(1, id);
            ps.setString(2, h.getHospitalName());
            ps.setString(3, h.getStreet());
            ps.setString(4, h.getArea());
            ps.setString(5, h.getCity());
            ps.setString(6, h.getPincode());
            return ps;
        });
        h.setHospitalId(id);

        saveChildRecords(id, h);
        return h;
    }

    public int update(Long id, Hospital h) {
        int rows = jdbcTemplate.update(
                "UPDATE hospital SET name = ?, street = ?, area = ?, city = ?, pincode = ? WHERE hospital_id = ?",
                h.getHospitalName(), h.getStreet(), h.getArea(), h.getCity(), h.getPincode(), id);

        updateChildRecords(id, h);
        return rows;
    }

    private void saveChildRecords(Long hospitalId, Hospital h) {
        if (h.getPhones() != null) {
            Set<String> seen = new HashSet<>();
            for (String phone : h.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String clean = phone.trim();
                    if (seen.add(clean)) {
                        jdbcTemplate.update("INSERT INTO hospital_phone (hospital_id, contact_no) VALUES (?, ?)", hospitalId, clean);
                    }
                }
            }
        }

        if (h.getDoctors() != null) {
            Set<Long> seen = new HashSet<>();
            for (DoctorAffiliation aff : h.getDoctors()) {
                if (aff != null && aff.getDoctorId() != null) {
                    if (seen.add(aff.getDoctorId())) {
                        jdbcTemplate.update("INSERT INTO hospital_doctor (hospital_id, doctor_id, role) VALUES (?, ?, ?)",
                                hospitalId, aff.getDoctorId(), aff.getRole());
                    }
                }
            }
        }
    }

    private void updateChildRecords(Long hospitalId, Hospital h) {
        if (h.getPhones() != null) {
            jdbcTemplate.update("DELETE FROM hospital_phone WHERE hospital_id = ?", hospitalId);
            Set<String> seen = new HashSet<>();
            for (String phone : h.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String clean = phone.trim();
                    if (seen.add(clean)) {
                        jdbcTemplate.update("INSERT INTO hospital_phone (hospital_id, contact_no) VALUES (?, ?)", hospitalId, clean);
                    }
                }
            }
        }

        if (h.getDoctors() != null) {
            jdbcTemplate.update("DELETE FROM hospital_doctor WHERE hospital_id = ?", hospitalId);
            Set<Long> seen = new HashSet<>();
            for (DoctorAffiliation aff : h.getDoctors()) {
                if (aff != null && aff.getDoctorId() != null) {
                    if (seen.add(aff.getDoctorId())) {
                        jdbcTemplate.update("INSERT INTO hospital_doctor (hospital_id, doctor_id, role) VALUES (?, ?, ?)",
                                hospitalId, aff.getDoctorId(), aff.getRole());
                    }
                }
            }
        }
    }

    public int deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM hospital_phone WHERE hospital_id = ?", id);
        jdbcTemplate.update("DELETE FROM hospital_doctor WHERE hospital_id = ?", id);
        return jdbcTemplate.update("DELETE FROM hospital WHERE hospital_id = ?", id);
    }
}
