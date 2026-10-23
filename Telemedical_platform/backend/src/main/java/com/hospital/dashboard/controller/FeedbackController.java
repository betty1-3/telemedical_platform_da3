package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.exception.ResourceNotFoundException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * FEEDBACK table. Uses feedback_comment (NOT comment) and rating (1-5) per
 * the database's reserved-word workaround.
 */
@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private static final String TABLE = "feedback";
    private static final String ID_COLUMN = "feedback_id";

    private final GenericTableRepository repo;

    public FeedbackController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/{id}")
    public Map<String, Object> getOne(@PathVariable Long id) {
        Map<String, Object> row = repo.findOneByColumn(TABLE, ID_COLUMN, id);
        if (row == null) throw new ResourceNotFoundException("Feedback not found with id " + id);
        return row;
    }

    /** So the frontend can load a patient's feedback history dynamically. */
    @GetMapping("/patient/{patientId}")
    public List<Map<String, Object>> getByPatient(@PathVariable Long patientId) {
        return repo.findByColumn(TABLE, "patient_id", patientId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        validate(body);
        return repo.insert(TABLE, ID_COLUMN, body);
    }

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        validate(body);
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

    private void validate(Map<String, Object> body) {
        if (body.get("patient_id") == null) throw new InvalidRequestException("patient_id is required");
        Object rating = body.get("rating");
        if (rating == null) throw new InvalidRequestException("rating is required");
        int r = ((Number) rating).intValue();
        if (r < 1 || r > 5) throw new InvalidRequestException("rating must be between 1 and 5");
    }
}
