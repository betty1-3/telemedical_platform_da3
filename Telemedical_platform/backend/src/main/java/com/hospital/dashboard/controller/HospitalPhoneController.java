package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** HOSPITAL_PHONE - composite key (hospital_id, contact_no). NOTE: this table's
 *  phone column is named contact_no in the real schema, not phone_no/phone_number. */
@RestController
@RequestMapping("/api/hospital-phones")
public class HospitalPhoneController {

    private static final String TABLE = "hospital_phone";

    private final GenericTableRepository repo;

    public HospitalPhoneController(GenericTableRepository repo) {
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("hospital_id") == null) throw new InvalidRequestException("hospital_id is required");
        if (body.get("contact_no") == null) throw new InvalidRequestException("contact_no is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long hospitalId, @RequestParam String contactNo) {
        repo.deleteByColumns(TABLE, Map.of("hospital_id", hospitalId, "contact_no", contactNo));
    }
}
