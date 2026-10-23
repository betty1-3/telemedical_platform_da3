package com.hospital.dashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Hospital Management Dashboard backend (DA2 scope only).
 *
 * This is a plain Spring Boot + Spring JDBC (JdbcTemplate) REST backend.
 * There is intentionally NO Spring Security / authentication here -
 * the assignment scope explicitly excludes login/register and DA3 features.
 */
@SpringBootApplication
public class HospitalDashboardApplication {
    public static void main(String[] args) {
        SpringApplication.run(HospitalDashboardApplication.class, args);
    }
}
