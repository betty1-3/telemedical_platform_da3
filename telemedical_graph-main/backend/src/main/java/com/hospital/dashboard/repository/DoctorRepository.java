package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.Doctor;
import com.hospital.dashboard.model.HospitalAffiliation;
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
public class DoctorRepository {

    private final JdbcTemplate jdbcTemplate;

    public DoctorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<Doctor> ROW_MAPPER = (rs, rowNum) -> {
        Doctor d = new Doctor();
        d.setDoctorId(rs.getLong("doctor_id"));
        d.setFirstName(rs.getString("first_name"));
        d.setLastName(rs.getString("last_name"));
        d.setDob(rs.getDate("dob") != null ? rs.getDate("dob").toLocalDate() : null);
        d.setGender(rs.getString("gender"));
        d.setDateJoined(rs.getDate("date_joined") != null ? rs.getDate("date_joined").toLocalDate() : null);
        d.setLicenseNumber(rs.getString("license_no"));
        java.math.BigDecimal experience = rs.getBigDecimal("experience");
        d.setExperience(experience != null ? experience.intValue() : null);
        return d;
    };

    public List<Doctor> findAll() {
        List<Doctor> doctors = jdbcTemplate.query(
                "SELECT d.doctor_id, d.first_name, d.last_name, d.dob, d.gender, d.date_joined, d.license_no, d.experience, " +
                "ds.specialization, dr.rating " +
                "FROM doctor d " +
                "LEFT JOIN doctor_specialization ds ON d.doctor_id = ds.doctor_id " +
                "LEFT JOIN doctor_rating dr ON d.doctor_id = dr.doctor_id " +
                "ORDER BY d.doctor_id",
                (rs, rowNum) -> {
                    Doctor d = ROW_MAPPER.mapRow(rs, rowNum);
                    if (d != null) {
                        d.setSpecialization(rs.getString("specialization"));
                        java.math.BigDecimal r = rs.getBigDecimal("rating");
                        if (r != null) d.setRating(r.intValue());
                    }
                    return d;
                }
        );
        return doctors;
    }

    public Optional<Doctor> findById(Long id) {
        Optional<Doctor> opt = jdbcTemplate.query("SELECT * FROM doctor WHERE doctor_id = ?", ROW_MAPPER, id).stream().findFirst();
        opt.ifPresent(this::populateRelatedData);
        return opt;
    }

    private void populateRelatedData(Doctor d) {
        Long id = d.getDoctorId();
        // Phones
        List<String> phones = jdbcTemplate.query(
                "SELECT phone_no FROM doctor_phone WHERE doctor_id = ? ORDER BY phone_no",
                (rs, rowNum) -> rs.getString("phone_no"), id);
        d.setPhones(phones);

        // Qualifications
        List<String> qualifications = jdbcTemplate.query(
                "SELECT qualification FROM doctor_qualification WHERE doctor_id = ? ORDER BY qualification",
                (rs, rowNum) -> rs.getString("qualification"), id);
        d.setQualifications(qualifications);

        // Specialization
        List<String> specs = jdbcTemplate.query(
                "SELECT specialization FROM doctor_specialization WHERE doctor_id = ?",
                (rs, rowNum) -> rs.getString("specialization"), id);
        if (!specs.isEmpty()) d.setSpecialization(specs.get(0));

        // Rating
        List<Integer> ratings = jdbcTemplate.query(
                "SELECT rating FROM doctor_rating WHERE doctor_id = ?",
                (rs, rowNum) -> rs.getInt("rating"), id);
        if (!ratings.isEmpty()) d.setRating(ratings.get(0));

        // Hospitals
        List<HospitalAffiliation> hospitals = jdbcTemplate.query(
                "SELECT hospital_id, role FROM hospital_doctor WHERE doctor_id = ? ORDER BY hospital_id",
                (rs, rowNum) -> new HospitalAffiliation(rs.getLong("hospital_id"), rs.getString("role")), id);
        d.setHospitals(hospitals);
    }

    public Doctor save(Doctor d) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_doctor.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO doctor (doctor_id, first_name, last_name, dob, gender, date_joined, license_no, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            ps.setLong(1, id);
            ps.setString(2, d.getFirstName());
            ps.setString(3, d.getLastName());
            ps.setDate(4, d.getDob() != null ? Date.valueOf(d.getDob()) : null);
            ps.setString(5, d.getGender());
            ps.setDate(6, d.getDateJoined() != null ? Date.valueOf(d.getDateJoined()) : null);
            ps.setString(7, d.getLicenseNumber());
            ps.setObject(8, d.getExperience());
            return ps;
        });
        d.setDoctorId(id);

        saveChildRecords(id, d);
        return d;
    }

    public int update(Long id, Doctor d) {
        int rows = jdbcTemplate.update(
                "UPDATE doctor SET first_name = ?, last_name = ?, dob = ?, gender = ?, date_joined = ?, license_no = ?, experience = ? WHERE doctor_id = ?",
                d.getFirstName(), d.getLastName(),
                d.getDob() != null ? Date.valueOf(d.getDob()) : null,
                d.getGender(),
                d.getDateJoined() != null ? Date.valueOf(d.getDateJoined()) : null,
                d.getLicenseNumber(), d.getExperience(), id);

        updateChildRecords(id, d);
        return rows;
    }

    private void saveChildRecords(Long doctorId, Doctor d) {
        // Phones
        if (d.getPhones() != null) {
            Set<String> seen = new HashSet<>();
            for (String phone : d.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String p = phone.trim();
                    if (seen.add(p)) {
                        jdbcTemplate.update("INSERT INTO doctor_phone (doctor_id, phone_no) VALUES (?, ?)", doctorId, p);
                    }
                }
            }
        }

        // Qualifications
        if (d.getQualifications() != null) {
            Set<String> seen = new HashSet<>();
            for (String qual : d.getQualifications()) {
                if (qual != null && !qual.trim().isEmpty()) {
                    String q = qual.trim();
                    if (seen.add(q)) {
                        jdbcTemplate.update("INSERT INTO doctor_qualification (doctor_id, qualification) VALUES (?, ?)", doctorId, q);
                    }
                }
            }
        }

        // Specialization
        if (d.getSpecialization() != null && !d.getSpecialization().trim().isEmpty()) {
            jdbcTemplate.update("INSERT INTO doctor_specialization (doctor_id, specialization) VALUES (?, ?)",
                    doctorId, d.getSpecialization().trim().toUpperCase());
        }

        // Rating
        if (d.getRating() != null && d.getRating() >= 1 && d.getRating() <= 5) {
            jdbcTemplate.update("INSERT INTO doctor_rating (doctor_id, rating) VALUES (?, ?)", doctorId, d.getRating());
        }

        // Hospitals
        if (d.getHospitals() != null) {
            Set<Long> seen = new HashSet<>();
            for (HospitalAffiliation aff : d.getHospitals()) {
                if (aff != null && aff.getHospitalId() != null) {
                    if (seen.add(aff.getHospitalId())) {
                        jdbcTemplate.update("INSERT INTO hospital_doctor (hospital_id, doctor_id, role) VALUES (?, ?, ?)",
                                aff.getHospitalId(), doctorId, aff.getRole());
                    }
                }
            }
        }
    }

    private void updateChildRecords(Long doctorId, Doctor d) {
        if (d.getPhones() != null) {
            jdbcTemplate.update("DELETE FROM doctor_phone WHERE doctor_id = ?", doctorId);
            Set<String> seen = new HashSet<>();
            for (String phone : d.getPhones()) {
                if (phone != null && !phone.trim().isEmpty()) {
                    String p = phone.trim();
                    if (seen.add(p)) {
                        jdbcTemplate.update("INSERT INTO doctor_phone (doctor_id, phone_no) VALUES (?, ?)", doctorId, p);
                    }
                }
            }
        }

        if (d.getQualifications() != null) {
            jdbcTemplate.update("DELETE FROM doctor_qualification WHERE doctor_id = ?", doctorId);
            Set<String> seen = new HashSet<>();
            for (String qual : d.getQualifications()) {
                if (qual != null && !qual.trim().isEmpty()) {
                    String q = qual.trim();
                    if (seen.add(q)) {
                        jdbcTemplate.update("INSERT INTO doctor_qualification (doctor_id, qualification) VALUES (?, ?)", doctorId, q);
                    }
                }
            }
        }

        if (d.getSpecialization() != null) {
            jdbcTemplate.update("DELETE FROM doctor_specialization WHERE doctor_id = ?", doctorId);
            if (!d.getSpecialization().trim().isEmpty()) {
                jdbcTemplate.update("INSERT INTO doctor_specialization (doctor_id, specialization) VALUES (?, ?)",
                        doctorId, d.getSpecialization().trim().toUpperCase());
            }
        }

        if (d.getRating() != null) {
            jdbcTemplate.update("DELETE FROM doctor_rating WHERE doctor_id = ?", doctorId);
            if (d.getRating() >= 1 && d.getRating() <= 5) {
                jdbcTemplate.update("INSERT INTO doctor_rating (doctor_id, rating) VALUES (?, ?)", doctorId, d.getRating());
            }
        }

        if (d.getHospitals() != null) {
            jdbcTemplate.update("DELETE FROM hospital_doctor WHERE doctor_id = ?", doctorId);
            Set<Long> seen = new HashSet<>();
            for (HospitalAffiliation aff : d.getHospitals()) {
                if (aff != null && aff.getHospitalId() != null) {
                    if (seen.add(aff.getHospitalId())) {
                        jdbcTemplate.update("INSERT INTO hospital_doctor (hospital_id, doctor_id, role) VALUES (?, ?, ?)",
                                aff.getHospitalId(), doctorId, aff.getRole());
                    }
                }
            }
        }
    }

    public int deleteById(Long id) {
        jdbcTemplate.update("DELETE FROM doctor_phone WHERE doctor_id = ?", id);
        jdbcTemplate.update("DELETE FROM doctor_qualification WHERE doctor_id = ?", id);
        jdbcTemplate.update("DELETE FROM doctor_specialization WHERE doctor_id = ?", id);
        jdbcTemplate.update("DELETE FROM doctor_rating WHERE doctor_id = ?", id);
        jdbcTemplate.update("DELETE FROM hospital_doctor WHERE doctor_id = ?", id);
        return jdbcTemplate.update("DELETE FROM doctor WHERE doctor_id = ?", id);
    }
}
