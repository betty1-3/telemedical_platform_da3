package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.Medicine;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class MedicineRepository {

    private final JdbcTemplate jdbcTemplate;

    public MedicineRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<Medicine> ROW_MAPPER = (rs, rowNum) -> {
        Medicine m = new Medicine();
        m.setMedicineId(rs.getLong("medicine_id"));
        m.setMedicineName(rs.getString("medicine_name"));
        m.setMedicineType(rs.getString("medicine_type"));
        return m;
    };

    public List<Medicine> findAll() {
        return jdbcTemplate.query("SELECT * FROM medicine ORDER BY medicine_id", ROW_MAPPER);
    }

    public Optional<Medicine> findById(Long id) {
        return jdbcTemplate.query("SELECT * FROM medicine WHERE medicine_id = ?", ROW_MAPPER, id).stream().findFirst();
    }

    public Medicine save(Medicine m) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_medicine.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO medicine (medicine_id, medicine_name, medicine_type) VALUES (?, ?, ?)");
            ps.setLong(1, id);
            ps.setString(2, m.getMedicineName());
            ps.setString(3, m.getMedicineType());
            return ps;
        });
        m.setMedicineId(id);
        return m;
    }

    public int update(Long id, Medicine m) {
        return jdbcTemplate.update(
                "UPDATE medicine SET medicine_name = ?, medicine_type = ? WHERE medicine_id = ?",
                m.getMedicineName(), m.getMedicineType(), id);
    }

    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM medicine WHERE medicine_id = ?", id);
    }
}
