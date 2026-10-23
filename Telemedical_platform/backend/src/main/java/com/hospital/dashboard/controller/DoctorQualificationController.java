package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DOCTOR_QUALIFICATION - real schema is just (doctor_id, qualification), with
 * NO surrogate id column. So, like the phone tables, there is no /{id}
 * lookup/update/delete - rows are addressed by the full (doctor_id,
 * qualification) pair instead.
 */
@RestController
@RequestMapping("/api/doctor-qualifications")
public class DoctorQualificationController {

    private static final String TABLE = "doctor_qualification";

    private final GenericTableRepository repo;

    public DoctorQualificationController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Map<String, Object>> getByDoctor(@PathVariable Long doctorId) {
        return repo.findByColumn(TABLE, "doctor_id", doctorId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("doctor_id") == null) throw new InvalidRequestException("doctor_id is required");
        if (body.get("qualification") == null) throw new InvalidRequestException("qualification is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long doctorId, @RequestParam String qualification) {
        repo.deleteByColumns(TABLE, Map.of("doctor_id", doctorId, "qualification", qualification));
    }
}
