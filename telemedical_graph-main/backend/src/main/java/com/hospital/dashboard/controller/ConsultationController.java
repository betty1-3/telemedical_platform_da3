package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.Consultation;
import com.hospital.dashboard.service.ConsultationService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService service;

    public ConsultationController(ConsultationService service) {
        this.service = service;
    }

    @GetMapping
    public List<Consultation> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Consultation getOne(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Consultation create(@RequestBody Consultation consultation) {
        return service.create(consultation);
    }

    @PutMapping("/{id}")
    public Consultation update(@PathVariable Long id, @RequestBody Consultation consultation) {
        return service.update(id, consultation);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
