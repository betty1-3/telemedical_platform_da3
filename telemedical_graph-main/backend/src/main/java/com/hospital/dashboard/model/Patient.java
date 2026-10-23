package com.hospital.dashboard.model;

import java.time.LocalDate;
import java.util.List;

/** Maps to the PATIENT table and its child/related entities (phones, medical records, feedback). */
public class Patient {

    private Long patientId;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String city;
    private String area;
    private String pincode;

    // Related collections
    private List<String> phones;
    private List<MedicalRecordDto> medicalRecords;
    private List<FeedbackDto> feedbacks;

    public Patient() { }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public List<String> getPhones() { return phones; }
    public void setPhones(List<String> phones) { this.phones = phones; }

    public List<MedicalRecordDto> getMedicalRecords() { return medicalRecords; }
    public void setMedicalRecords(List<MedicalRecordDto> medicalRecords) { this.medicalRecords = medicalRecords; }

    public List<FeedbackDto> getFeedbacks() { return feedbacks; }
    public void setFeedbacks(List<FeedbackDto> feedbacks) { this.feedbacks = feedbacks; }
}
