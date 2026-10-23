package com.hospital.dashboard.model;

public class DoctorAffiliation {
    private Long doctorId;
    private String role;

    public DoctorAffiliation() {}

    public DoctorAffiliation(Long doctorId, String role) {
        this.doctorId = doctorId;
        this.role = role;
    }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
