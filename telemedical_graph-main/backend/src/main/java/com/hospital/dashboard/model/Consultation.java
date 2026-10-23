package com.hospital.dashboard.model;

import java.time.LocalDate;

public class Consultation {

    private Long consultationId;
    private Long patientId;
    private Long doctorId;
    private LocalDate bookingDate;
    private LocalDate date;
    private String startTime;
    private String endTime;
    private String status;
    private String consultationMode;
    private String videoLink;
    private String callNumber;
    private String chatTranscriptId;

    public Consultation() { }

    public Long getConsultationId() { return consultationId; }
    public void setConsultationId(Long consultationId) { this.consultationId = consultationId; }
    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public LocalDate getBookingDate() { return bookingDate; }
    public void setBookingDate(LocalDate bookingDate) { this.bookingDate = bookingDate; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }
    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getConsultationMode() { return consultationMode; }
    public void setConsultationMode(String consultationMode) { this.consultationMode = consultationMode; }
    public String getVideoLink() { return videoLink; }
    public void setVideoLink(String videoLink) { this.videoLink = videoLink; }
    public String getCallNumber() { return callNumber; }
    public void setCallNumber(String callNumber) { this.callNumber = callNumber; }
    public String getChatTranscriptId() { return chatTranscriptId; }
    public void setChatTranscriptId(String chatTranscriptId) { this.chatTranscriptId = chatTranscriptId; }
}
