package com.hospital.dashboard.service;

import com.hospital.dashboard.model.graph.OracleGraphSnapshot;
import com.hospital.dashboard.repository.graph.Neo4jGraphRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;

/** Builds an Oracle-consistent graph projection on explicit request or after API writes. */
@Service
public class OracleGraphSyncService {
    private final JdbcTemplate jdbc;
    private final Neo4jGraphRepository graph;

    public OracleGraphSyncService(JdbcTemplate jdbc, Neo4jGraphRepository graph) {
        this.jdbc = jdbc;
        this.graph = graph;
    }

    public synchronized void refresh() {
        OracleGraphSnapshot snapshot = new OracleGraphSnapshot(
                rows("SELECT patient_id, city FROM patient",
                        "patientId", "PATIENT_ID", "city", "CITY"),
                rows("SELECT d.doctor_id, d.first_name, d.last_name, d.first_name || ' ' || d.last_name name, TO_CHAR(d.dob,'YYYY-MM-DD') dob, d.gender, TO_CHAR(d.date_joined,'YYYY-MM-DD') date_joined, d.license_no, d.experience FROM doctor d",
                        "doctorId", "DOCTOR_ID", "firstName", "FIRST_NAME", "lastName", "LAST_NAME", "name", "NAME", "dob", "DOB", "gender", "GENDER", "dateJoined", "DATE_JOINED", "licenseNo", "LICENSE_NO", "experience", "EXPERIENCE"),
                rows("SELECT hospital_id, name, street, area, city, pincode FROM hospital",
                        "hospitalId", "HOSPITAL_ID", "name", "NAME", "street", "STREET", "area", "AREA", "city", "CITY", "pincode", "PINCODE"),
                rows("SELECT consultation_id, patient_id, doctor_id, TO_CHAR(\"Date\",'YYYY-MM-DD') appointment_date, status, consultation_mode FROM consultation",
                        "appointmentId", "CONSULTATION_ID", "patientId", "PATIENT_ID", "doctorId", "DOCTOR_ID", "appointmentDate", "APPOINTMENT_DATE", "status", "STATUS", "mode", "CONSULTATION_MODE"),
                rows("SELECT DISTINCT specialization code, INITCAP(REPLACE(specialization,'_',' ')) name FROM doctor_specialization",
                        "code", "CODE", "name", "NAME"),
                rows("SELECT prescription_id, consultation_id, TO_CHAR(p_date,'YYYY-MM-DD') p_date, dosage FROM prescription",
                        "prescriptionId", "PRESCRIPTION_ID", "consultationId", "CONSULTATION_ID", "date", "P_DATE", "dosage", "DOSAGE"),
                rows("SELECT medicine_id, medicine_name, medicine_type FROM medicine",
                        "medicineId", "MEDICINE_ID", "name", "MEDICINE_NAME", "type", "MEDICINE_TYPE"),
                rows("SELECT test_id, test_name, test_type FROM test",
                        "testId", "TEST_ID", "name", "TEST_NAME", "type", "TEST_TYPE"),
                rows("SELECT patient_id, consultation_id FROM consultation WHERE patient_id IS NOT NULL",
                        "patientId", "PATIENT_ID", "appointmentId", "CONSULTATION_ID"),
                rows("SELECT consultation_id, doctor_id FROM consultation WHERE doctor_id IS NOT NULL",
                        "appointmentId", "CONSULTATION_ID", "doctorId", "DOCTOR_ID"),
                rows("SELECT doctor_id, specialization FROM doctor_specialization",
                        "doctorId", "DOCTOR_ID", "code", "SPECIALIZATION"),
                rows("SELECT hospital_id, doctor_id, role FROM hospital_doctor",
                        "hospitalId", "HOSPITAL_ID", "doctorId", "DOCTOR_ID", "role", "ROLE"),
                rows("SELECT consultation_id, prescription_id FROM prescription",
                        "appointmentId", "CONSULTATION_ID", "prescriptionId", "PRESCRIPTION_ID"),
                rows("SELECT prescription_id, medicine_id FROM prescription_medicine",
                        "prescriptionId", "PRESCRIPTION_ID", "medicineId", "MEDICINE_ID"),
                rows("SELECT prescription_id, test_id FROM prescription_test",
                        "prescriptionId", "PRESCRIPTION_ID", "testId", "TEST_ID"));
        graph.synchronizeOracleProjection(snapshot);
    }

    public void ensureGraphAvailable() {
        graph.health();
    }

    private List<Map<String, Object>> rows(String sql, String... fields) {
        List<Map<String, Object>> result = new ArrayList<>();
        jdbc.query(sql, rs -> {
            Map<String, Object> row = new LinkedHashMap<>();
            for (int i = 0; i < fields.length; i += 2) {
                row.put(fields[i], neoValue(rs, fields[i + 1]));
            }
            result.add(row);
        });
        return result;
    }

    private Object neoValue(ResultSet rs, String column) throws SQLException {
        Object value = rs.getObject(column);
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value == null) return null;
        if (List.of("DOB", "DATE_JOINED", "APPOINTMENT_DATE", "P_DATE").contains(column)) {
            return LocalDate.parse(value.toString());
        }
        return value.toString();
    }
}
