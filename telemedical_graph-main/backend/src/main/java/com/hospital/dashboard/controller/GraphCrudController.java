package com.hospital.dashboard.controller;

import com.hospital.dashboard.model.Consultation;
import com.hospital.dashboard.model.Doctor;
import com.hospital.dashboard.model.Hospital;
import com.hospital.dashboard.model.MedicalTest;
import com.hospital.dashboard.model.Medicine;
import com.hospital.dashboard.model.Prescription;
import com.hospital.dashboard.service.ConsultationService;
import com.hospital.dashboard.service.DoctorService;
import com.hospital.dashboard.service.HospitalService;
import com.hospital.dashboard.service.MedicineService;
import com.hospital.dashboard.service.PrescriptionService;
import com.hospital.dashboard.service.TestService;
import com.hospital.dashboard.service.OracleGraphSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** CRUD entry points for graph entities; writes go through Oracle then refresh Neo4j. */
@RestController
@RequestMapping("/api/graph/crud")
public class GraphCrudController {
    private final DoctorService doctors;
    private final HospitalService hospitals;
    private final ConsultationService consultations;
    private final PrescriptionService prescriptions;
    private final MedicineService medicines;
    private final TestService tests;
    private final OracleGraphSyncService graphSync;

    public GraphCrudController(DoctorService doctors, HospitalService hospitals,
                               ConsultationService consultations, PrescriptionService prescriptions,
                               MedicineService medicines, TestService tests, OracleGraphSyncService graphSync) {
        this.doctors = doctors;
        this.hospitals = hospitals;
        this.consultations = consultations;
        this.prescriptions = prescriptions;
        this.medicines = medicines;
        this.tests = tests;
        this.graphSync = graphSync;
    }

    private void ensureGraphAvailable() { graphSync.ensureGraphAvailable(); }

    @GetMapping("/doctors") public List<Doctor> doctors() { return doctors.getAll(); }
    @GetMapping("/doctors/{id}") public Doctor doctor(@PathVariable Long id) { return doctors.getById(id); }
    @PostMapping("/doctors") @ResponseStatus(HttpStatus.CREATED) public Doctor createDoctor(@RequestBody Doctor body) { ensureGraphAvailable(); return doctors.create(body); }
    @PutMapping("/doctors/{id}") public Doctor updateDoctor(@PathVariable Long id, @RequestBody Doctor body) { ensureGraphAvailable(); return doctors.update(id, body); }
    @DeleteMapping("/doctors/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteDoctor(@PathVariable Long id) { ensureGraphAvailable(); doctors.delete(id); }

    @GetMapping("/hospitals") public List<Hospital> hospitals() { return hospitals.getAll(); }
    @GetMapping("/hospitals/{id}") public Hospital hospital(@PathVariable Long id) { return hospitals.getById(id); }
    @PostMapping("/hospitals") @ResponseStatus(HttpStatus.CREATED) public Hospital createHospital(@RequestBody Hospital body) { ensureGraphAvailable(); return hospitals.create(body); }
    @PutMapping("/hospitals/{id}") public Hospital updateHospital(@PathVariable Long id, @RequestBody Hospital body) { ensureGraphAvailable(); return hospitals.update(id, body); }
    @DeleteMapping("/hospitals/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteHospital(@PathVariable Long id) { ensureGraphAvailable(); hospitals.delete(id); }

    @GetMapping("/consultations") public List<Consultation> consultations() { return consultations.getAll(); }
    @GetMapping("/consultations/{id}") public Consultation consultation(@PathVariable Long id) { return consultations.getById(id); }
    @PostMapping("/consultations") @ResponseStatus(HttpStatus.CREATED) public Consultation createConsultation(@RequestBody Consultation body) { ensureGraphAvailable(); return consultations.create(body); }
    @PutMapping("/consultations/{id}") public Consultation updateConsultation(@PathVariable Long id, @RequestBody Consultation body) { ensureGraphAvailable(); return consultations.update(id, body); }
    @DeleteMapping("/consultations/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteConsultation(@PathVariable Long id) { ensureGraphAvailable(); consultations.delete(id); }

    @GetMapping("/prescriptions") public List<Prescription> prescriptions() { return prescriptions.getAll(); }
    @GetMapping("/prescriptions/{id}") public Prescription prescription(@PathVariable Long id) { return prescriptions.getById(id); }
    @PostMapping("/prescriptions") @ResponseStatus(HttpStatus.CREATED) public Prescription createPrescription(@RequestBody Prescription body) { ensureGraphAvailable(); return prescriptions.create(body); }
    @PutMapping("/prescriptions/{id}") public Prescription updatePrescription(@PathVariable Long id, @RequestBody Prescription body) { ensureGraphAvailable(); return prescriptions.update(id, body); }
    @DeleteMapping("/prescriptions/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deletePrescription(@PathVariable Long id) { ensureGraphAvailable(); prescriptions.delete(id); }

    @GetMapping("/medicines") public List<Medicine> medicines() { return medicines.getAll(); }
    @GetMapping("/medicines/{id}") public Medicine medicine(@PathVariable Long id) { return medicines.getById(id); }
    @PostMapping("/medicines") @ResponseStatus(HttpStatus.CREATED) public Medicine createMedicine(@RequestBody Medicine body) { ensureGraphAvailable(); return medicines.create(body); }
    @PutMapping("/medicines/{id}") public Medicine updateMedicine(@PathVariable Long id, @RequestBody Medicine body) { ensureGraphAvailable(); return medicines.update(id, body); }
    @DeleteMapping("/medicines/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteMedicine(@PathVariable Long id) { ensureGraphAvailable(); medicines.delete(id); }

    @GetMapping("/tests") public List<MedicalTest> tests() { return tests.getAll(); }
    @GetMapping("/tests/{id}") public MedicalTest test(@PathVariable Long id) { return tests.getById(id); }
    @PostMapping("/tests") @ResponseStatus(HttpStatus.CREATED) public MedicalTest createTest(@RequestBody MedicalTest body) { ensureGraphAvailable(); return tests.create(body); }
    @PutMapping("/tests/{id}") public MedicalTest updateTest(@PathVariable Long id, @RequestBody MedicalTest body) { ensureGraphAvailable(); return tests.update(id, body); }
    @DeleteMapping("/tests/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deleteTest(@PathVariable Long id) { ensureGraphAvailable(); tests.delete(id); }
}
