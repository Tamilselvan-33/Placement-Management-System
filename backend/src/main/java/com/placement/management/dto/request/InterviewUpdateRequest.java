package com.placement.management.dto.request;

import com.placement.management.enums.InterviewMode;
import com.placement.management.enums.InterviewRound;
import com.placement.management.enums.InterviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewUpdateRequest {
    private InterviewRound round;
    private LocalDate interviewDate;
    private String interviewTime;
    private InterviewMode mode;
    private String venueOrLink;
    private InterviewStatus status;
    private String feedback;
    private String interviewerName;
}
