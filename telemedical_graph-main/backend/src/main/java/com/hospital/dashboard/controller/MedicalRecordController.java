package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

    private static final String TABLE = "medical_record";
    private static final String ID_COLUMN = "medical_record_id";

    private final GenericTableRepository repo;

    public MedicalRecordController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOne(@PathVariable Long id) {
        Map<String, Object> row = repo.findOneByColumn(TABLE, ID_COLUMN, id);
        if (row == null) throw new ResourceNotFoundException("Medical record not found with id " + id);
        return row;
    }

    @GetMapping("/patient/{patientId}")
    public List<Map<String, Object>> getByPatient(@PathVariable Long patientId) {
        return repo.findByColumn(TABLE, "patient_id", patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("patient_id") == null) throw new InvalidRequestException("patient_id is required");
        return repo.insert(TABLE, ID_COLUMN, body);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        getOne(id);
        repo.updateByColumn(TABLE, ID_COLUMN, id, body);
        body.put(ID_COLUMN, id);
        return body;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        getOne(id);
        repo.deleteByColumn(TABLE, ID_COLUMN, id);
    }
}
