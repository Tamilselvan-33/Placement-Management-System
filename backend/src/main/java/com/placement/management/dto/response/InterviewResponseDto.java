package com.placement.management.dto.response;

import com.placement.management.enums.InterviewMode;
import com.placement.management.enums.InterviewRound;
import com.placement.management.enums.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponseDto {
    private Long id;
    private Long applicationId;
    private Long studentId;
    private String studentName;
    private String studentRegNo;
    private String studentEmail;
    private String studentDepartment;

    private Long companyId;
    private String companyName;

    private Long driveId;
    private String jobTitle;

    private InterviewRound round;
    private String roundDisplayName;
    private LocalDate interviewDate;
    private String interviewTime;
    private InterviewMode mode;
    private String venueOrLink;
    private InterviewStatus status;
    private String feedback;
    private String interviewerName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
