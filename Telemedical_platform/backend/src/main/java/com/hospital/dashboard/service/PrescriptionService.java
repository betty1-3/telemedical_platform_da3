package com.hospital.dashboard.service;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.model.Prescription;
import com.hospital.dashboard.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository repository;

    public PrescriptionService(PrescriptionRepository repository) {
        this.repository = repository;
    }

    public List<Prescription> getAll() {
        return repository.findAll();
    }

    public Prescription getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found with id " + id));
    }

    @Transactional
    public Prescription create(Prescription prescription) {
        validate(prescription);
        return repository.save(prescription);
    }

    @Transactional
    public Prescription update(Long id, Prescription prescription) {
        validate(prescription);
        getById(id);
        repository.update(id, prescription);
        prescription.setPrescriptionId(id);
        return prescription;
    }

    @Transactional
    public void delete(Long id) {
        getById(id);
        repository.deleteById(id);
    }

    private void validate(Prescription p) {
        if (p.getConsultationId() == null) throw new InvalidRequestException("consultationId is required");
        if (p.getPrescriptionDate() == null) throw new InvalidRequestException("prescriptionDate is required");
    }
}
