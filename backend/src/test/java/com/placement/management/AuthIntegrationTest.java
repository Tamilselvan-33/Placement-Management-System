package com.placement.management;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.dto.request.StudentRegisterRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should successfully authenticate admin with seeded credentials")
    void testAdminLoginSuccess() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@placement.edu")
                .password("Password@123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testLoginInvalidCredentials() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@placement.edu")
                .password("WrongPassword")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Should register new student and prevent duplicate registration number")
    void testStudentRegistration() throws Exception {
        String uniqueEmail = "new.student" + System.currentTimeMillis() + "@placement.edu";
        String uniqueReg = "REG" + System.currentTimeMillis();

        StudentRegisterRequest regRequest = StudentRegisterRequest.builder()
                .fullName("Test Student")
                .email(uniqueEmail)
                .password("Password@123")
                .registrationNumber(uniqueReg)
                .department("CSE")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("8.50"))
                .backlogs(0)
                .build();

        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.role").value("ROLE_STUDENT"));

        // Attempt duplicate registration
        mockMvc.perform(post("/api/auth/register/student")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regRequest)))
                .andExpect(status().isConflict());
    }
}

