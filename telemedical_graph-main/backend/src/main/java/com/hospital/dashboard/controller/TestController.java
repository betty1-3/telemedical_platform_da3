package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.MedicalTest;
import com.hospital.dashboard.service.TestService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    private final TestService service;

    public TestController(TestService service) {
        this.service = service;
    }

    @GetMapping
    public List<MedicalTest> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public MedicalTest getOne(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MedicalTest create(@RequestBody MedicalTest test) {
        return service.create(test);
    }

    @PutMapping("/{id}")
    public MedicalTest update(@PathVariable Long id, @RequestBody MedicalTest test) {
        return service.update(id, test);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
