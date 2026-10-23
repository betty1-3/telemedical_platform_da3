package com.hospital.dashboard.model;

import java.time.LocalDate;
import java.util.List;

/** Maps to the PRESCRIPTION table and its junction link tables (prescription_medicine, prescription_test). */
public class Prescription {

    private Long prescriptionId;
    private Long consultationId;
    private LocalDate prescriptionDate;
    private String dosage;

    // Related collections
    private List<Long> medicineIds;
    private List<Long> testIds;

    public Prescription() { }

    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }

    public Long getConsultationId() { return consultationId; }
    public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }

    public LocalDate getPrescriptionDate() { return prescriptionDate; }
    public void setPrescriptionDate(LocalDate prescriptionDate) { this.prescriptionDate = prescriptionDate; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public List<Long> getMedicineIds() { return medicineIds; }
    public void setMedicineIds(List<Long> medicineIds) { this.medicineIds = medicineIds; }

    public List<Long> getTestIds() { return testIds; }
    public void setTestIds(List<Long> testIds) { this.testIds = testIds; }
}
