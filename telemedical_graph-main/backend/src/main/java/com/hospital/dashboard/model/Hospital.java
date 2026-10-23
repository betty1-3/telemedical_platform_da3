package com.hospital.dashboard.model;

import java.util.List;

/** Maps to the HOSPITAL table and its child/related entities (phones, affiliated doctors). */
public class Hospital {

    private Long hospitalId;
    private String hospitalName;
    private String street;
    private String area;
    private String city;
    private String pincode;

    // Related collections
    private List<String> phones;
    private List<DoctorAffiliation> doctors;

    public Hospital() { }

    public Long getHospitalId() { return hospitalId; }
    public void setHospitalId(Long hospitalId) { this.hospitalId = hospitalId; }

    public String getHospitalName() { return hospitalName; }
    public void setHospitalName(String hospitalName) { this.hospitalName = hospitalName; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) { this.phones = phones; }

    public List<DoctorAffiliation> getDoctors() { return doctors; }
    public void setDoctors(List<DoctorAffiliation> doctors) { this.doctors = doctors; }
}
