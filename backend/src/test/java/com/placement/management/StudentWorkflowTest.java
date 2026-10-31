package com.placement.management;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.dto.request.StudentProfileUpdateRequest;
import com.placement.management.entity.JobDrive;
import com.placement.management.entity.Student;
import com.placement.management.repository.JobDriveRepository;
import com.placement.management.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StudentWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private JobDriveRepository jobDriveRepository;

    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("arun.kumar@placement.edu")
                .password("Password@123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        studentToken = root.path("data").path("token").asText();
    }

    @Test
    @DisplayName("Should retrieve student profile")
    void testGetProfile() throws Exception {
        mockMvc.perform(get("/api/student/profile")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("arun.kumar@placement.edu"))
                .andExpect(jsonPath("$.data.registrationNumber").value("21CS001"));
    }

    @Test
    @DisplayName("Should update student profile details")
    void testUpdateProfile() throws Exception {
        StudentProfileUpdateRequest updateReq = StudentProfileUpdateRequest.builder()
                .fullName("Arun Kumar Updated")
                .phone("+91 97111 99999")
                .department("CSE")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("9.10"))
                .backlogs(0)
                .technicalSkills("Distributed Systems, Kubernetes, Go, Java")
                .build();

        mockMvc.perform(put("/api/student/profile")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Arun Kumar Updated"))
                .andExpect(jsonPath("$.data.cgpa").value(9.10));
    }

    @Test
    @DisplayName("Should block student from accessing admin endpoints (RBAC)")
    void testStudentCannotAccessAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Should verify eligibility check logic on backend")
    void testCheckEligibility() throws Exception {
        JobDrive drive = jobDriveRepository.findActiveDrives().get(0);

        mockMvc.perform(get("/api/student/drives/" + drive.getId() + "/eligibility")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.driveId").value(drive.getId()));
    }
}

