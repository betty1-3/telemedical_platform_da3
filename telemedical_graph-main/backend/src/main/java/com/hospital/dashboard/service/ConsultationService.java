package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Consultation;
import com.hospital.dashboard.repository.ConsultationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ConsultationService {

    private static final Set<String> VALID_MODES = Set.of("VIDEO", "AUDIO", "CHAT");

    private final ConsultationRepository repository;

    public ConsultationService(ConsultationRepository repository) {
        this.repository = repository;
    }

    public List<Consultation> getAll() {
        return repository.findAll();
    }

    public Consultation getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id " + id));
    }

    public Consultation create(Consultation c) {
        validate(c);
        return repository.save(c);
    }

    public Consultation update(Long id, Consultation c) {
        validate(c);
        getById(id);
        repository.update(id, c);
        c.setConsultationId(id);
        return c;
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Consultation c) {
        if (c.getPatientId() == null) throw new InvalidRequestException("patientId is required");
        if (c.getDoctorId() == null) throw new InvalidRequestException("doctorId is required");
        if (c.getBookingDate() == null) throw new InvalidRequestException("bookingDate is required");
        if (c.getDate() == null) throw new InvalidRequestException("date is required");
        if (isBlank(c.getStartTime())) throw new InvalidRequestException("startTime is required");
        if (isBlank(c.getEndTime())) throw new InvalidRequestException("endTime is required");
        if (isBlank(c.getStatus())) throw new InvalidRequestException("status is required");
        if (isBlank(c.getConsultationMode()) || !VALID_MODES.contains(c.getConsultationMode().toUpperCase())) {
            throw new InvalidRequestException("consultationMode must be one of VIDEO, AUDIO, CHAT");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
