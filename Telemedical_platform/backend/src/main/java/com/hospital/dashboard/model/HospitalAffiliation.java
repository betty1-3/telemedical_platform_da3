package com.hospital.dashboard.model;

public class HospitalAffiliation {
    private Long hospitalId;
    private String role;

    public HospitalAffiliation() {}

    public HospitalAffiliation(Long hospitalId, String role) {
        this.hospitalId = hospitalId;
        this.role = role;
    }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
