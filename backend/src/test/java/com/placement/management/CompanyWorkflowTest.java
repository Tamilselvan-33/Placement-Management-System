package com.placement.management;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.management.dto.request.JobDriveRequest;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.enums.DriveStatus;
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
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CompanyWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String companyToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("recruiter@google.com")
                .password("Password@123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        companyToken = root.path("data").path("token").asText();
    }

    @Test
    @DisplayName("Should retrieve company profile")
    void testGetCompanyProfile() throws Exception {
        mockMvc.perform(get("/api/company/profile")
                        .header("Authorization", "Bearer " + companyToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.companyName").value("Google"));
    }

    @Test
    @DisplayName("Should create a new job drive")
    void testCreateJobDrive() throws Exception {
        JobDriveRequest driveReq = JobDriveRequest.builder()
                .jobTitle("AI Research Engineer")
                .jobDescription("Research and development of next-generation multimodal generative models.")
                .requiredSkills("Python, PyTorch, Linear Algebra, Distributed Computing")
                .eligibleDepartments("CSE,IT")
                .minimumCgpa(new BigDecimal("8.50"))
                .maxBacklogs(0)
                .graduationYear(2025)
                .salaryPackage(new BigDecimal("30.00"))
                .jobLocation("Bangalore")
                .employmentType("Full Time")
                .openingDate(LocalDate.now())
                .applicationDeadline(LocalDate.now().plusDays(20))
                .status(DriveStatus.OPEN)
                .build();

        mockMvc.perform(post("/api/company/drives")
                        .header("Authorization", "Bearer " + companyToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driveReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.jobTitle").value("AI Research Engineer"))
                .andExpect(jsonPath("$.data.salaryPackage").value(30.00));
    }

    @Test
    @DisplayName("Company recruiter cannot access student endpoints")
    void testCompanyCannotAccessStudentEndpoints() throws Exception {
        mockMvc.perform(get("/api/student/profile")
                        .header("Authorization", "Bearer " + companyToken))
                .andExpect(status().isForbidden());
    }
}

