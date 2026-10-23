package com.hospital.dashboard.model;

/**
 * Maps to the TEST table. Named MedicalTest in Java (not Test) purely to avoid
 * confusion with JUnit's Test annotation - the SQL table name is still "test".
 * NOTE: no cost column in the real schema.
 */
public class MedicalTest {

    private Long testId;
    private String testName;
    private String testType;

    public MedicalTest() { }

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public String getTestName() { return testName; }
    public void setTestName(String testName) { this.testName = testName; }

    public String getTestType() { return testType; }
    public void setTestType(String testType) { this.testType = testType; }
}
