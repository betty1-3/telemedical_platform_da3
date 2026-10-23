package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Payment;
import com.hospital.dashboard.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository repository;

    public PaymentService(PaymentRepository repository) {
        this.repository = repository;
    }

    public List<Payment> getAll() {
        return repository.findAll();
    }

    public Payment getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id " + id));
    }

    public Payment create(Payment payment) {
        validate(payment);
        return repository.save(payment);
    }

    public Payment update(Long id, Payment payment) {
        validate(payment);
        getById(id);
        repository.update(id, payment);
        payment.setPaymentId(id);
        return payment;
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Payment p) {
        if (p.getConsultationId() == null) throw new InvalidRequestException("consultationId is required");
        if (p.getAmount() == null || p.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidRequestException("amount must be greater than 0");
        }
        if (isBlank(p.getPaidBy())) throw new InvalidRequestException("paidBy is required");
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
