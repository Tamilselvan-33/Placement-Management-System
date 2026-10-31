package com.placement.management.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRegisterRequest {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "College email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Department is required")
    private String department;

    private String degree;

    @NotNull(message = "Graduation year is required")
    @Min(value = 2020, message = "Graduation year must be valid")
    @Max(value = 2035, message = "Graduation year must be valid")
    private Integer graduationYear;

    private String phone;

    @DecimalMin(value = "0.0", message = "CGPA must be positive")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    private BigDecimal cgpa;

    @Min(value = 0, message = "Backlogs cannot be negative")
    private Integer backlogs;
}
