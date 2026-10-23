package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.FeedbackDto;
import com.hospital.dashboard.model.Patient;
import com.hospital.dashboard.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class PatientService {

    private static final Set<String> VALID_GENDERS = Set.of("M", "F", "O");

    private final PatientRepository repository;

    public PatientService(PatientRepository repository) {
        this.repository = repository;
    }

    public List<Patient> getAll() {
        return repository.findAll();
    }

    public Patient getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + id));
    }

    @Transactional
    public Patient create(Patient patient) {
        validate(patient);
        return repository.save(patient);
    }

    @Transactional
    public Patient update(Long id, Patient patient) {
        validate(patient);
        getById(id);
        repository.update(id, patient);
        patient.setPatientId(id);
        return patient;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Patient p) {
        if (isBlank(p.getFirstName())) throw new InvalidRequestException("firstName is required");
        if (isBlank(p.getLastName())) throw new InvalidRequestException("lastName is required");
        if (p.getDob() == null) throw new InvalidRequestException("dob is required");
        if (isBlank(p.getCity())) throw new InvalidRequestException("city is required");
        if (p.getGender() != null && !p.getGender().trim().isEmpty()) {
            String g = p.getGender().trim().toUpperCase();
            if (!VALID_GENDERS.contains(g)) {
                throw new InvalidRequestException("gender must be one of: M, F, O");
            }
        }
        if (p.getFeedbacks() != null) {
            for (FeedbackDto fb : p.getFeedbacks()) {
                if (fb != null && fb.getRating() != null) {
                    if (fb.getRating() < 1 || fb.getRating() > 5) {
                        throw new InvalidRequestException("Feedback rating must be between 1 and 5");
                    }
                }
            }
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
