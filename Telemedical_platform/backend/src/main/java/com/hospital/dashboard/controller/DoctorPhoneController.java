package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** DOCTOR_PHONE - composite key (doctor_id, phone_no), no surrogate id. */
@RestController
@RequestMapping("/api/doctor-phones")
public class DoctorPhoneController {

    private static final String TABLE = "doctor_phone";

    private final GenericTableRepository repo;

    public DoctorPhoneController(GenericTableRepository repo) {
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
        if (body.get("phone_no") == null) throw new InvalidRequestException("phone_no is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long doctorId, @RequestParam String phoneNo) {
        repo.deleteByColumns(TABLE, Map.of("doctor_id", doctorId, "phone_no", phoneNo));
    }
}
