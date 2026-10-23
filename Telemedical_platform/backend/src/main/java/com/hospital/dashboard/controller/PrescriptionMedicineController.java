package com.hospital.dashboard.controller;

import com.hospital.dashboard.exception.InvalidRequestException;
import com.hospital.dashboard.repository.GenericTableRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** PRESCRIPTION_MEDICINE - which medicines belong to a prescription. Real schema
 *  is just (prescription_id, medicine_id) - no dosage/duration columns. */
@RestController
@RequestMapping("/api/prescription-medicines")
public class PrescriptionMedicineController {

    private static final String TABLE = "prescription_medicine";

    private final GenericTableRepository repo;

    public PrescriptionMedicineController(GenericTableRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, Object>> getAll() {
        return repo.findAll(TABLE);
    }

    @GetMapping("/prescription/{prescriptionId}")
    public List<Map<String, Object>> getByPrescription(@PathVariable Long prescriptionId) {
        return repo.findByColumn(TABLE, "prescription_id", prescriptionId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        if (body.get("prescription_id") == null) throw new InvalidRequestException("prescription_id is required");
        if (body.get("medicine_id") == null) throw new InvalidRequestException("medicine_id is required");
        return repo.insert(TABLE, null, body);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestParam Long prescriptionId, @RequestParam Long medicineId) {
        repo.deleteByColumns(TABLE, Map.of("prescription_id", prescriptionId, "medicine_id", medicineId));
    }
}
