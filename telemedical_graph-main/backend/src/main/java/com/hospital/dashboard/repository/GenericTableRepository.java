package com.hospital.dashboard.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
public class GenericTableRepository {

    private final JdbcTemplate jdbcTemplate;
    private final NamedParameterJdbcTemplate namedJdbcTemplate;

    private static final Map<String, String> SEQUENCES = Map.of(
            "patient", "seq_patient",
            "doctor", "seq_doctor",
            "hospital", "seq_hospital",
            "medicine", "seq_medicine",
            "test", "seq_test",
            "feedback", "seq_feedback",
            "medical_record", "seq_medical_record",
            "consultation", "seq_consultation",
            "payment", "seq_payment",
            "prescription", "seq_prescription"
    );

    public GenericTableRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
        this.namedJdbcTemplate = new NamedParameterJdbcTemplate(jdbcTemplate);
    }

    public List<Map<String, Object>> findAll(String table) {
        return jdbcTemplate.queryForList("SELECT * FROM " + table);
    }

    public List<Map<String, Object>> findByColumn(String table, String column, Object value) {
        return jdbcTemplate.queryForList("SELECT * FROM " + table + " WHERE " + column + " = ?", value);
    }

    public Map<String, Object> findOneByColumn(String table, String column, Object value) {
        List<Map<String, Object>> rows = findByColumn(table, column, value);
        return rows.isEmpty() ? null : rows.get(0);
    }

    public Map<String, Object> insert(String table, String idColumn, Map<String, Object> data) {
        Map<String, Object> columns = new LinkedHashMap<>(data);
        Long generatedId = null;
        if (idColumn != null) {
            String sequence = SEQUENCES.get(table.toLowerCase());
            if (sequence == null) throw new IllegalArgumentException("No sequence configured for table: " + table);
            generatedId = jdbcTemplate.queryForObject("SELECT " + sequence + ".NEXTVAL FROM dual", Long.class);
            columns.put(idColumn, generatedId);
        }

        String columnList = String.join(", ", columns.keySet());
        String placeholders = columns.keySet().stream().map(c -> ":" + c).collect(Collectors.joining(", "));
        String sql = "INSERT INTO " + table + " (" + columnList + ") VALUES (" + placeholders + ")";
        namedJdbcTemplate.update(sql, new MapSqlParameterSource(columns));

        Map<String, Object> result = new LinkedHashMap<>(columns);
        if (idColumn != null) result.put(idColumn, generatedId);
        return result;
    }

    public int updateByColumn(String table, String idColumn, Object idValue, Map<String, Object> data) {
        Map<String, Object> columns = new LinkedHashMap<>(data);
        columns.remove(idColumn);
        String setClause = columns.keySet().stream().map(c -> c + " = :" + c).collect(Collectors.joining(", "));
        String sql = "UPDATE " + table + " SET " + setClause + " WHERE " + idColumn + " = :__id";
        MapSqlParameterSource params = new MapSqlParameterSource(columns);
        params.addValue("__id", idValue);
        return namedJdbcTemplate.update(sql, params);
    }

    public int deleteByColumn(String table, String column, Object value) {
        return jdbcTemplate.update("DELETE FROM " + table + " WHERE " + column + " = ?", value);
    }

    public int deleteByColumns(String table, Map<String, Object> keyColumns) {
        String whereClause = keyColumns.keySet().stream()
                .map(c -> c + " = :" + c)
                .collect(Collectors.joining(" AND "));
        String sql = "DELETE FROM " + table + " WHERE " + whereClause;
        return namedJdbcTemplate.update(sql, new MapSqlParameterSource(keyColumns));
    }
}
