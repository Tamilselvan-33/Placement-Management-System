package com.placement.management.dto.request;

import com.placement.management.enums.InterviewMode;
import com.placement.management.enums.InterviewRound;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewScheduleRequest {

    @NotNull(message = "Application ID is required")
    private Long applicationId;

    @NotNull(message = "Interview round is required")
    private InterviewRound round;

    @NotNull(message = "Interview date is required")
    private LocalDate interviewDate;

    @NotBlank(message = "Interview time is required")
    private String interviewTime;

    @NotNull(message = "Interview mode is required")
    private InterviewMode mode;

    private String venueOrLink;
    private String interviewerName;
    private String feedback;
}
