package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Hospital;
import com.hospital.dashboard.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HospitalService {

    private final HospitalRepository repository;

    public HospitalService(HospitalRepository repository) {
        this.repository = repository;
    }

    public List<Hospital> getAll() {
        return repository.findAll();
    }

    public Hospital getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + id));
    }

    @Transactional
    public Hospital create(Hospital hospital) {
        validate(hospital);
        return repository.save(hospital);
    }

    @Transactional
    public Hospital update(Long id, Hospital hospital) {
        validate(hospital);
        getById(id);
        repository.update(id, hospital);
        hospital.setHospitalId(id);
        return hospital;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Hospital h) {
        if (isBlank(h.getHospitalName())) throw new InvalidRequestException("hospitalName is required");
        if (isBlank(h.getCity())) throw new InvalidRequestException("city is required");
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
