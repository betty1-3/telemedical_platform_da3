package com.hospital.dashboard.model;

import java.time.LocalDate;
import java.util.List;

/** Maps to the DOCTOR table and its child/related entities (phones, qualifications, specialization, rating, hospital affiliations). */
public class Doctor {

    private Long doctorId;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private LocalDate dateJoined;
    private String licenseNumber;
    private Integer experience;

    // Related collections & attributes
    private List<String> phones;
    private List<String> qualifications;
    private String specialization;
    private Integer rating;
    private List<HospitalAffiliation> hospitals;

    public Doctor() { }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateJoined() { return dateJoined; }
    public void setDateJoined(LocalDate dateJoined) { this.dateJoined = dateJoined; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public Integer getExperience() { return experience; }
    public void setExperience(Integer experience) { this.experience = experience; }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) { this.phones = phones; }

    public List<String> getQualifications() { return qualifications; }
    public void setQualifications(List<String> qualifications) { this.qualifications = qualifications; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public List<HospitalAffiliation> getHospitals() { return hospitals; }
    public void setHospitals(List<HospitalAffiliation> hospitals) { this.hospitals = hospitals; }
}
