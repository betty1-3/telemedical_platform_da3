package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.Hospital;
import com.hospital.dashboard.service.HospitalService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hospitals")
public class HospitalController {

    private final HospitalService service;

    public HospitalController(HospitalService service) {
        this.service = service;
    }

    @GetMapping
    public List<Hospital> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Hospital getOne(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Hospital create(@RequestBody Hospital hospital) {
        return service.create(hospital);
    }

    @PutMapping("/{id}")
    public Hospital update(@PathVariable Long id, @RequestBody Hospital hospital) {
        return service.update(id, hospital);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
