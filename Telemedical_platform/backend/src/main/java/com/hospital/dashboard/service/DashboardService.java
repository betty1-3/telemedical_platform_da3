package com.hospital.dashboard.service;

import com.hospital.dashboard.model.DashboardSummary;
import com.hospital.dashboard.repository.DashboardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final DashboardRepository repository;

    public DashboardService(DashboardRepository repository) {
        this.repository = repository;
    }

    public DashboardSummary getSummary() {
        return new DashboardSummary(
                repository.countPatients(),
                repository.countDoctors(),
                repository.countHospitals(),
                repository.countConsultations(),
                repository.countPrescriptions(),
                repository.countPayments(),
                repository.totalRevenue()
        );
    }

    public List<Map<String, Object>> getConsultationsByStatus() {
        return repository.consultationsByStatus();
    }

    public List<Map<String, Object>> getPatientsByCity() {
        return repository.patientsByCity();
    }

    public List<Map<String, Object>> getDoctorsBySpecialization() {
        return repository.doctorsBySpecialization();
    }

    public List<Map<String, Object>> getPaymentSummary() {
        return repository.paymentSummaryByMethod();
    }
}
