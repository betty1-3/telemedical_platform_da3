package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** HOSPITAL_DOCTOR - which doctors practice at which hospitals (many-to-many).
 *  The real schema also has an optional "role" column; since this table is
 *  Map-based, just include "role" in the request body if you want to set it. */
@RestController
@RequestMapping("/api/hospital-doctors")
public class HospitalDoctorController {

    private static final String TABLE = "hospital_doctor";

    private final GenericTableRepository repo;

    public HospitalDoctorController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Map<String, Object>> getByHospital(@PathVariable Long hospitalId) {
        return repo.findByColumn(TABLE, "hospital_id", hospitalId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<Map<String, Object>> getByDoctor(@PathVariable Long doctorId) {
        return repo.findByColumn(TABLE, "doctor_id", doctorId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("hospital_id") == null) throw new InvalidRequestException("hospital_id is required");
        if (body.get("doctor_id") == null) throw new InvalidRequestException("doctor_id is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long hospitalId, @RequestParam Long doctorId) {
        repo.deleteByColumns(TABLE, Map.of("hospital_id", hospitalId, "doctor_id", doctorId));
    }
}
