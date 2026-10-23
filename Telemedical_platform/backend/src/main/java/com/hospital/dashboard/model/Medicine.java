package com.hospital.dashboard.model;

/** Maps to the MEDICINE table. NOTE: no manufacturer or price column in the real schema. */
public class Medicine {

    private Long medicineId;
    private String medicineName;
    private String medicineType;

    public Medicine() { }

    public Long getMedicineId() { return medicineId; }
    public void setMedicineId(Long medicineId) { this.medicineId = medicineId; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getMedicineType() { return medicineType; }
    public void setMedicineType(String medicineType) { this.medicineType = medicineType; }
}
