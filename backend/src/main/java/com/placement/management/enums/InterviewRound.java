package com.placement.management.enums;

public enum InterviewRound {
    ONLINE_ASSESSMENT("Online Assessment"),
    TECHNICAL_INTERVIEW_1("Technical Interview 1"),
    TECHNICAL_INTERVIEW_2("Technical Interview 2"),
    MANAGERIAL_INTERVIEW("Managerial Interview"),
    HR_INTERVIEW("HR Interview");

    private final String displayName;

    InterviewRound(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
