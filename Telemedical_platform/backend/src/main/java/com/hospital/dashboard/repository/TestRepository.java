package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.MedicalTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class TestRepository {

    private final JdbcTemplate jdbcTemplate;

    public TestRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final RowMapper<MedicalTest> ROW_MAPPER = (rs, rowNum) -> {
        MedicalTest t = new MedicalTest();
        t.setTestId(rs.getLong("test_id"));
        t.setTestName(rs.getString("test_name"));
        t.setTestType(rs.getString("test_type"));
        return t;
    };

    public List<MedicalTest> findAll() {
        return jdbcTemplate.query("SELECT * FROM test ORDER BY test_id", ROW_MAPPER);
    }

    public Optional<MedicalTest> findById(Long id) {
        return jdbcTemplate.query("SELECT * FROM test WHERE test_id = ?", ROW_MAPPER, id).stream().findFirst();
    }

    public MedicalTest save(MedicalTest t) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_test.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO test (test_id, test_name, test_type) VALUES (?, ?, ?)");
            ps.setLong(1, id);
            ps.setString(2, t.getTestName());
            ps.setString(3, t.getTestType());
            return ps;
        });
        t.setTestId(id);
        return t;
    }

    public int update(Long id, MedicalTest t) {
        return jdbcTemplate.update(
                "UPDATE test SET test_name = ?, test_type = ? WHERE test_id = ?",
                t.getTestName(), t.getTestType(), id);
    }

    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM test WHERE test_id = ?", id);
    }
}
