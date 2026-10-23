package com.hospital.dashboard.repository;

import com.hospital.dashboard.model.Payment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Optional;

@Repository
public class PaymentRepository {

    private final JdbcTemplate jdbcTemplate;

    public PaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String SELECT_ALL = "SELECT payment_id, consultation_id, payment_amount, paid_by FROM payment";

    private static final RowMapper<Payment> ROW_MAPPER = (rs, rowNum) -> {
        Payment p = new Payment();
        p.setPaymentId(rs.getLong("payment_id"));
        p.setConsultationId(rs.getLong("consultation_id"));
        p.setAmount(rs.getBigDecimal("payment_amount"));
        p.setPaidBy(rs.getString("paid_by"));
        return p;
    };

    public List<Payment> findAll() {
        return jdbcTemplate.query(SELECT_ALL + " ORDER BY payment_id", ROW_MAPPER);
    }

    public Optional<Payment> findById(Long id) {
        return jdbcTemplate.query(SELECT_ALL + " WHERE payment_id = ?", ROW_MAPPER, id).stream().findFirst();
    }

    public Payment save(Payment p) {
        Long id = jdbcTemplate.queryForObject("SELECT seq_payment.NEXTVAL FROM dual", Long.class);
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO payment (payment_id, consultation_id, payment_amount, paid_by) VALUES (?, ?, ?, ?)");
            ps.setLong(1, id);
            ps.setLong(2, p.getConsultationId());
            ps.setBigDecimal(3, p.getAmount());
            ps.setString(4, p.getPaidBy());
            return ps;
        });
        p.setPaymentId(id);
        return p;
    }

    public int update(Long id, Payment p) {
        return jdbcTemplate.update(
                "UPDATE payment SET consultation_id = ?, payment_amount = ?, paid_by = ? WHERE payment_id = ?",
                p.getConsultationId(), p.getAmount(), p.getPaidBy(), id);
    }

    public int deleteById(Long id) {
        return jdbcTemplate.update("DELETE FROM payment WHERE payment_id = ?", id);
    }
}
