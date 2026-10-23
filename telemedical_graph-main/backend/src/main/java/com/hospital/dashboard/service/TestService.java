package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.MedicalTest;
import com.hospital.dashboard.repository.TestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TestService {

    private final TestRepository repository;

    public TestService(TestRepository repository) {
        this.repository = repository;
    }

    public List<MedicalTest> getAll() {
        return repository.findAll();
    }

    public MedicalTest getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found with id " + id));
    }

    public MedicalTest create(MedicalTest t) {
        validate(t);
        return repository.save(t);
    }

    public MedicalTest update(Long id, MedicalTest t) {
        validate(t);
        getById(id);
        repository.update(id, t);
        t.setTestId(id);
        return t;
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(MedicalTest t) {
        if (isBlank(t.getTestName())) throw new InvalidRequestException("testName is required");
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
