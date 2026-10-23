package com.hospital.dashboard.model;

public class MedicalRecordDto {
    private Long medicalRecordId;
    private String symptoms;
    private String diagnoses;

    public MedicalRecordDto() {}

    public MedicalRecordDto(Long medicalRecordId, String symptoms, String diagnoses) {
        this.medicalRecordId = medicalRecordId;
        this.symptoms = symptoms;
        this.diagnoses = diagnoses;
    }

    public Long getMedicalRecordId() { return medicalRecordId; }
    public void setMedicalRecordId(Long medicalRecordId) { this.medicalRecordId = medicalRecordId; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getDiagnoses() { return diagnoses; }
    public void setDiagnoses(String diagnoses) { this.diagnoses = diagnoses; }
}
