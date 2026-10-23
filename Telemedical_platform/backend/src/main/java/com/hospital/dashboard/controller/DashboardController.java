package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.DashboardSummary;
import com.hospital.dashboard.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Dashboard endpoints. Every value here is computed live from Oracle via
 * aggregate SQL (see DashboardRepository) - nothing is hardcoded.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(DashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public DashboardSummary summary() {
        return service.getSummary();
    }

    @GetMapping("/consultations-by-status")
    public List<Map<String, Object>> consultationsByStatus() {
        return service.getConsultationsByStatus();
    }

    @GetMapping("/patients-by-city")
    public List<Map<String, Object>> patientsByCity() {
        return service.getPatientsByCity();
    }

    @GetMapping("/doctors-by-specialization")
    public List<Map<String, Object>> doctorsBySpecialization() {
        return service.getDoctorsBySpecialization();
    }

    @GetMapping("/payment-summary")
    public List<Map<String, Object>> paymentSummary() {
        return service.getPaymentSummary();
    }
}
