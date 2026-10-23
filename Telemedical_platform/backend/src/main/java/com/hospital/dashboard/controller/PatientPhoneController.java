package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * PATIENT_PHONE - a simple composite-key table (patient_id, phone_no),
 * so there is no single surrogate id: rows are looked up and deleted by the
 * full key pair instead of by /{id}.
 */
@RestController
@RequestMapping("/api/patient-phones")
public class PatientPhoneController {

    private static final String TABLE = "patient_phone";

    private final GenericTableRepository repo;

    public PatientPhoneController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/patient/{patientId}")
    public List<Map<String, Object>> getByPatient(@PathVariable Long patientId) {
        return repo.findByColumn(TABLE, "patient_id", patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("patient_id") == null) throw new InvalidRequestException("patient_id is required");
        if (body.get("phone_no") == null) throw new InvalidRequestException("phone_no is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long patientId, @RequestParam String phoneNo) {
        repo.deleteByColumns(TABLE, Map.of("patient_id", patientId, "phone_no", phoneNo));
    }
}
