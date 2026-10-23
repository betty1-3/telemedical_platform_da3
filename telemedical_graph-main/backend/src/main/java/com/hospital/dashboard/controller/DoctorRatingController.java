package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DOCTOR_RATING - real schema is just (doctor_id, rating), with NO surrogate
 * id and NO patient_id/comment column. Like the phone tables, there is no
 * /{id} lookup/update/delete - rows are addressed by the full
 * (doctor_id, rating) pair. Rating must be between 1 and 5 (same rule as
 * FEEDBACK).
 */
@RestController
@RequestMapping("/api/doctor-ratings")
public class DoctorRatingController {

    private static final String TABLE = "doctor_rating";

    private final GenericTableRepository repo;

    public DoctorRatingController(GenericTableRepository repo) {
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
        validate(body);
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long doctorId, @RequestParam Integer rating) {
        repo.deleteByColumns(TABLE, Map.of("doctor_id", doctorId, "rating", rating));
    }

    private void validate(Map<String, Object> body) {
        if (body.get("doctor_id") == null) throw new InvalidRequestException("doctor_id is required");
        Object rating = body.get("rating");
        if (rating == null) throw new InvalidRequestException("rating is required");
        int r = ((Number) rating).intValue();
        if (r < 1 || r > 5) throw new InvalidRequestException("rating must be between 1 and 5");
    }
}
