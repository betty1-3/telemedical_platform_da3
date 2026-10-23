package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Doctor;
import com.hospital.dashboard.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class DoctorService {

    private static final Set<String> VALID_SPECIALIZATIONS = Set.of(
            "GENERAL_PHYSICIAN", "CARDIOLOGIST", "NEUROLOGIST", "DERMATOLOGIST", "PSYCHIATRIST"
    );

    private final DoctorRepository repository;

    public DoctorService(DoctorRepository repository) {
        this.repository = repository;
    }

    public List<Doctor> getAll() {
        return repository.findAll();
    }

    public Doctor getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + id));
    }

    @Transactional
    public Doctor create(Doctor doctor) {
        validate(doctor);
        return repository.save(doctor);
    }

    @Transactional
    public Doctor update(Long id, Doctor doctor) {
        validate(doctor);
        getById(id);
        repository.update(id, doctor);
        doctor.setDoctorId(id);
        return doctor;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Doctor d) {
        if (isBlank(d.getFirstName())) throw new InvalidRequestException("firstName is required");
        if (isBlank(d.getLastName())) throw new InvalidRequestException("lastName is required");
        if (d.getDob() == null) throw new InvalidRequestException("dob is required");
        if (d.getDateJoined() == null) throw new InvalidRequestException("dateJoined is required");
        if (isBlank(d.getLicenseNumber())) throw new InvalidRequestException("licenseNumber is required");
        if (d.getExperience() == null || d.getExperience() < 0) {
            throw new InvalidRequestException("experience must be >= 0");
        }
        if (d.getSpecialization() != null && !d.getSpecialization().trim().isEmpty()) {
            String spec = d.getSpecialization().trim().toUpperCase();
            if (!VALID_SPECIALIZATIONS.contains(spec)) {
                throw new InvalidRequestException("Invalid specialization: " + spec + ". Must be one of: " + VALID_SPECIALIZATIONS);
            }
        }
        if (d.getRating() != null) {
            if (d.getRating() < 1 || d.getRating() > 5) {
                throw new InvalidRequestException("Rating must be between 1 and 5");
            }
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
