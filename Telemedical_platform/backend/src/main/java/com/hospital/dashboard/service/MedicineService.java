package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Medicine;
import com.hospital.dashboard.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineService {

    private final MedicineRepository repository;

    public MedicineService(MedicineRepository repository) {
        this.repository = repository;
    }

    public List<Medicine> getAll() {
        return repository.findAll();
    }

    public Medicine getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id " + id));
    }

    public Medicine create(Medicine m) {
        validate(m);
        return repository.save(m);
    }

    public Medicine update(Long id, Medicine m) {
        validate(m);
        getById(id);
        repository.update(id, m);
        m.setMedicineId(id);
        return m;
    }

    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Medicine m) {
        if (isBlank(m.getMedicineName())) throw new InvalidRequestException("medicineName is required");
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
