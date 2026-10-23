package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DOCTOR_SPECIALIZATION - real schema is just (doctor_id, specialization),
 * with NO surrogate id column. Like the phone tables, there is no /{id}
 * lookup/update/delete - rows are addressed by the full (doctor_id,
 * specialization) pair instead.
 */
@RestController
@RequestMapping("/api/doctor-specializations")
public class DoctorSpecializationController {

    private static final String TABLE = "doctor_specialization";

    private final GenericTableRepository repo;

    public DoctorSpecializationController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    /** Lets the frontend populate a "filter doctors by specialization" dropdown dynamically. */
    @GetMapping("/doctor/{doctorId}")
    public List<Map<String, Object>> getByDoctor(@PathVariable Long doctorId) {
        return repo.findByColumn(TABLE, "doctor_id", doctorId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("doctor_id") == null) throw new InvalidRequestException("doctor_id is required");
        if (body.get("specialization") == null) throw new InvalidRequestException("specialization is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long doctorId, @RequestParam String specialization) {
        repo.deleteByColumns(TABLE, Map.of("doctor_id", doctorId, "specialization", specialization));
    }
}
