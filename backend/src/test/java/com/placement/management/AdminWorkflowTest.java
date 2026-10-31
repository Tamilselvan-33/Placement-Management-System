package com.placement.management;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.dto.request.PlacementPolicyRequest;
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
public class AdminWorkflowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest login = LoginRequest.builder()
                .email("admin@placement.edu")
                .password("Password@123")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        adminToken = root.path("data").path("token").asText();
    }

    @Test
    @DisplayName("Should fetch complete admin dashboard with real statistics")
    void testGetDashboardOverview() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalStudents").isNumber())
                .andExpect(jsonPath("$.data.totalCompanies").isNumber())
                .andExpect(jsonPath("$.data.placementPercentage").isNumber())
                .andExpect(jsonPath("$.data.highestPackage").isNumber());
    }

    @Test
    @DisplayName("Should fetch placement analytics with department and yearly breakdowns")
    void testGetAnalytics() throws Exception {
        mockMvc.perform(get("/api/admin/analytics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.departmentStats").isArray())
                .andExpect(jsonPath("$.data.yearlyStats").isArray())
                .andExpect(jsonPath("$.data.companyHiringStats").isArray());
    }

    @Test
    @DisplayName("Should retrieve and update placement policy")
    void testPolicyManagement() throws Exception {
        mockMvc.perform(get("/api/admin/policies")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.maxOffersAllowed").isNumber());

        PlacementPolicyRequest policyReq = PlacementPolicyRequest.builder()
                .policyName("Updated Placement Policy 2026")
                .maxOffersAllowed(2)
                .allowApplicationsAfterAcceptance(false)
                .dreamCompanyCtcThreshold(new BigDecimal("15.00"))
                .allowDreamCompanyParticipation(true)
                .minCgpaDefault(new BigDecimal("6.50"))
                .maxBacklogsDefault(0)
                .build();

        mockMvc.perform(put("/api/admin/policies")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(policyReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.policyName").value("Updated Placement Policy 2026"))
                .andExpect(jsonPath("$.data.dreamCompanyCtcThreshold").value(15.00));
    }
}

