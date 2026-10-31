package com.placement.management.service;

import com.placement.management.entity.*;
import com.placement.management.enums.*;
import com.placement.management.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeedService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final JobDriveRepository jobDriveRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;
    private final OfferRepository offerRepository;
    private final PlacementPolicyRepository policyRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data seed.");
            return;
        }

        log.info("Seeding initial database records...");

        // 1. Placement Policy
        PlacementPolicy policy = PlacementPolicy.builder()
                .policyName("Campus General Placement Policy 2025-2026")
                .maxOffersAllowed(2)
                .allowApplicationsAfterAcceptance(false)
                .dreamCompanyCtcThreshold(new BigDecimal("12.00"))
                .allowDreamCompanyParticipation(true)
                .minCgpaDefault(new BigDecimal("6.50"))
                .maxBacklogsDefault(0)
                .isActive(true)
                .build();
        policyRepository.save(policy);

        // 2. Admin User
        User adminUser = User.builder()
                .email("admin@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Dr. Ramesh Sharma (Placement Director)")
                .phone("+91 98765 43210")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();
        userRepository.save(adminUser);

        // 3. Companies & Recruiter Users
        // Company 1: Google
        User googleUser = User.builder()
                .email("recruiter@google.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Sundar Pichai Recruitment Team")
                .phone("+91 98111 22233")
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        googleUser = userRepository.save(googleUser);

        Company google = Company.builder()
                .user(googleUser)
                .companyName("Google")
                .companyEmail("recruiter@google.com")
                .industry("Information Technology & Cloud")
                .location("Bangalore & Hyderabad")
                .website("https://careers.google.com")
                .contactPerson("Ananya Sen")
                .contactPhone("+91 98111 22233")
                .description("Google LLC is an American multinational technology company specializing in internet-related services and AI.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg")
                .verified(true)
                .build();
        google = companyRepository.save(google);

        // Company 2: Microsoft
        User msUser = User.builder()
                .email("careers@microsoft.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Microsoft Campus Talent")
                .phone("+91 98222 33344")
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        msUser = userRepository.save(msUser);

        Company microsoft = Company.builder()
                .user(msUser)
                .companyName("Microsoft")
                .companyEmail("careers@microsoft.com")
                .industry("Software & Cloud Computing")
                .location("Hyderabad & Noida")
                .website("https://careers.microsoft.com")
                .contactPerson("Rohit Mehra")
                .contactPhone("+91 98222 33344")
                .description("Microsoft Corporation enables digital transformation for the era of an intelligent cloud and intelligent edge.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg")
                .verified(true)
                .build();
        microsoft = companyRepository.save(microsoft);

        // Company 3: Amazon
        User amazonUser = User.builder()
                .email("hr@amazon.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Amazon University Talent")
                .phone("+91 98333 44455")
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        amazonUser = userRepository.save(amazonUser);

        Company amazon = Company.builder()
                .user(amazonUser)
                .companyName("Amazon")
                .companyEmail("hr@amazon.com")
                .industry("E-Commerce & Cloud Infrastructure")
                .location("Bangalore, Chennai & Hyderabad")
                .website("https://amazon.jobs")
                .contactPerson("Pooja Nair")
                .contactPhone("+91 98333 44455")
                .description("Amazon strives to be Earth's most customer-centric company, Earth's best employer, and Earth's safest place to work.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg")
                .verified(true)
                .build();
        amazon = companyRepository.save(amazon);

        // Company 4: TCS
        User tcsUser = User.builder()
                .email("talent@tcs.com")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("TCS Early Careers")
                .phone("+91 98444 55566")
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        tcsUser = userRepository.save(tcsUser);

        Company tcs = Company.builder()
                .user(tcsUser)
                .companyName("Tata Consultancy Services")
                .companyEmail("talent@tcs.com")
                .industry("IT Services & Consulting")
                .location("Pan India")
                .website("https://www.tcs.com/careers")
                .contactPerson("Vikram Joshi")
                .contactPhone("+91 98444 55566")
                .description("TCS is an IT services, consulting and business solutions organization that has been partnering with many of the world's largest businesses.")
                .logoUrl("https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg")
                .verified(true)
                .build();
        tcs = companyRepository.save(tcs);

        // 4. Students
        // Student 1: Arun Kumar (CSE, Placed)
        User uArun = User.builder()
                .email("arun.kumar@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Arun Kumar")
                .phone("+91 97111 00001")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        uArun = userRepository.save(uArun);

        Student sArun = Student.builder()
                .user(uArun)
                .registrationNumber("21CS001")
                .department("CSE")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("8.95"))
                .backlogs(0)
                .technicalSkills("Data Structures, Algorithms, System Design, React, Spring Boot, Docker")
                .programmingLanguages("Java, Python, C++, TypeScript")
                .projects("Distributed Cache System, E-commerce Microservices, Real-time Chat App")
                .certifications("AWS Certified Solutions Architect, Oracle Java SE 17 Developer")
                .linkedinUrl("https://linkedin.com/in/arunkumar-cs")
                .githubUrl("https://github.com/arunkumar-dev")
                .placementStatus(PlacementStatus.PLACED)
                .active(true)
                .build();
        sArun = studentRepository.save(sArun);

        // Student 2: Priya Sharma (ECE, Placed)
        User uPriya = User.builder()
                .email("priya.sharma@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Priya Sharma")
                .phone("+91 97111 00002")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        uPriya = userRepository.save(uPriya);

        Student sPriya = Student.builder()
                .user(uPriya)
                .registrationNumber("21EC015")
                .department("ECE")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("8.40"))
                .backlogs(0)
                .technicalSkills("Embedded Systems, IoT, Python, Machine Learning, MATLAB")
                .programmingLanguages("Python, C, Embedded C, SQL")
                .projects("Smart Traffic Surveillance using IoT, ECG Signal Classification using CNN")
                .certifications("NVIDIA Deep Learning Fundamentals")
                .linkedinUrl("https://linkedin.com/in/priyasharma-ece")
                .githubUrl("https://github.com/priyasharma-eng")
                .placementStatus(PlacementStatus.PLACED)
                .active(true)
                .build();
        sPriya = studentRepository.save(sPriya);

        // Student 3: Rahul Verma (IT, Unplaced, has 1 backlog)
        User uRahul = User.builder()
                .email("rahul.verma@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Rahul Verma")
                .phone("+91 97111 00003")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        uRahul = userRepository.save(uRahul);

        Student sRahul = Student.builder()
                .user(uRahul)
                .registrationNumber("21IT023")
                .department("IT")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("7.65"))
                .backlogs(1)
                .technicalSkills("Web Development, Node.js, Express, MongoDB, Linux")
                .programmingLanguages("JavaScript, Python, Java")
                .projects("Hostel Management System, Campus Events Portal")
                .certifications("Meta Frontend Developer Certificate")
                .linkedinUrl("https://linkedin.com/in/rahulverma-it")
                .githubUrl("https://github.com/rahulverma-it")
                .placementStatus(PlacementStatus.UNPLACED)
                .active(true)
                .build();
        sRahul = studentRepository.save(sRahul);

        // Student 4: Sneha Patel (MECH, Unplaced)
        User uSneha = User.builder()
                .email("sneha.patel@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Sneha Patel")
                .phone("+91 97111 00004")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        uSneha = userRepository.save(uSneha);

        Student sSneha = Student.builder()
                .user(uSneha)
                .registrationNumber("21ME040")
                .department("MECH")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("7.20"))
                .backlogs(0)
                .technicalSkills("SolidWorks, AutoCAD, ANSYS, Finite Element Analysis, Python for Engineers")
                .programmingLanguages("Python, C")
                .projects("Design Optimization of Electric Vehicle Chassis, Automated Solar Tracking Mechanism")
                .certifications("Autodesk Certified Professional")
                .linkedinUrl("https://linkedin.com/in/snehapatel-mech")
                .placementStatus(PlacementStatus.UNPLACED)
                .active(true)
                .build();
        sSneha = studentRepository.save(sSneha);

        // Student 5: Karthik R (CSE, High CGPA, Placed)
        User uKarthik = User.builder()
                .email("karthik.r@placement.edu")
                .password(passwordEncoder.encode("Password@123"))
                .fullName("Karthik Ramanathan")
                .phone("+91 97111 00005")
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        uKarthik = userRepository.save(uKarthik);

        Student sKarthik = Student.builder()
                .user(uKarthik)
                .registrationNumber("21CS088")
                .department("CSE")
                .degree("B.Tech")
                .graduationYear(2025)
                .cgpa(new BigDecimal("9.45"))
                .backlogs(0)
                .technicalSkills("Full Stack Development, Microservices, Kubernetes, High-Performance Computing")
                .programmingLanguages("Java, Golang, Rust, C++")
                .projects("Distributed Key-Value Store with Raft, Compiler Frontend in Rust")
                .certifications("Google Cloud Professional Cloud Architect")
                .linkedinUrl("https://linkedin.com/in/karthik-r-cs")
                .githubUrl("https://github.com/karthik-r-hpc")
                .placementStatus(PlacementStatus.PLACED)
                .active(true)
                .build();
        sKarthik = studentRepository.save(sKarthik);

        // 5. Job Drives
        // Drive 1: Google Software Engineer (Dream company)
        JobDrive dGoogle = JobDrive.builder()
                .company(google)
                .jobTitle("Software Development Engineer - I")
                .jobDescription("Join our Core Engineering and Cloud team building planetary scale distributed systems. You will design, develop, test, deploy, maintain, and enhance large-scale software solutions.")
                .requiredSkills("Data Structures, Algorithms, Distributed Systems, Java/Go/C++, Cloud Architecture")
                .eligibleDepartments("CSE,IT,ECE")
                .minimumCgpa(new BigDecimal("8.00"))
                .maxBacklogs(0)
                .graduationYear(2025)
                .salaryPackage(new BigDecimal("24.00")) // 24 LPA
                .jobLocation("Bangalore / Hyderabad")
                .employmentType("Full Time")
                .openingDate(LocalDate.now().minusDays(15))
                .applicationDeadline(LocalDate.now().plusDays(15))
                .status(DriveStatus.OPEN)
                .build();
        dGoogle = jobDriveRepository.save(dGoogle);

        // Drive 2: Microsoft SDE
        JobDrive dMicrosoft = JobDrive.builder()
                .company(microsoft)
                .jobTitle("Software Engineer (Cloud & AI)")
                .jobDescription("Microsoft is looking for innovative software engineers passionate about Cloud computing, Azure services, and modern developer platforms.")
                .requiredSkills("Object-Oriented Programming, C#/Java/C++, Azure, REST APIs, Problem Solving")
                .eligibleDepartments("CSE,IT,ECE")
                .minimumCgpa(new BigDecimal("7.50"))
                .maxBacklogs(0)
                .graduationYear(2025)
                .salaryPackage(new BigDecimal("18.50")) // 18.5 LPA
                .jobLocation("Hyderabad / Noida")
                .employmentType("Full Time")
                .openingDate(LocalDate.now().minusDays(20))
                .applicationDeadline(LocalDate.now().plusDays(10))
                .status(DriveStatus.OPEN)
                .build();
        dMicrosoft = jobDriveRepository.save(dMicrosoft);

        // Drive 3: Amazon SDE
        JobDrive dAmazon = JobDrive.builder()
                .company(amazon)
                .jobTitle("Software Development Engineer")
                .jobDescription("Build high-throughput customer-facing services that handle millions of transactions per second across Amazon's worldwide retail and cloud business.")
                .requiredSkills("Java/C++, Database Design, Low-Level Design, Algorithms, AWS Services")
                .eligibleDepartments("CSE,IT")
                .minimumCgpa(new BigDecimal("7.00"))
                .maxBacklogs(0)
                .graduationYear(2025)
                .salaryPackage(new BigDecimal("16.00")) // 16 LPA
                .jobLocation("Bangalore / Chennai")
                .employmentType("Full Time")
                .openingDate(LocalDate.now().minusDays(25))
                .applicationDeadline(LocalDate.now().plusDays(5))
                .status(DriveStatus.OPEN)
                .build();
        dAmazon = jobDriveRepository.save(dAmazon);

        // Drive 4: TCS Digital & Ninja
        JobDrive dTcs = JobDrive.builder()
                .company(tcs)
                .jobTitle("Digital Technology Specialist")
                .jobDescription("Work on cutting edge digital projects spanning AI, Cloud, Cybersecurity, IoT and Enterprise Automation across global clients.")
                .requiredSkills("Foundational Programming, Web Technologies, Database Concepts, Analytical Skills")
                .eligibleDepartments("ALL")
                .minimumCgpa(new BigDecimal("6.00"))
                .maxBacklogs(1)
                .graduationYear(2025)
                .salaryPackage(new BigDecimal("7.50")) // 7.5 LPA
                .jobLocation("Pan India")
                .employmentType("Full Time")
                .openingDate(LocalDate.now().minusDays(30))
                .applicationDeadline(LocalDate.now().plusDays(20))
                .status(DriveStatus.OPEN)
                .build();
        dTcs = jobDriveRepository.save(dTcs);

        // 6. Applications, Interviews, Offers
        // Arun applied to Microsoft -> Shortlisted -> Interviewed -> Offered -> ACCEPTED
        Application appArunMs = Application.builder()
                .student(sArun)
                .jobDrive(dMicrosoft)
                .status(ApplicationStatus.OFFER_ACCEPTED)
                .notes("Excellent performance in Technical and System Design rounds.")
                .build();
        appArunMs = applicationRepository.save(appArunMs);

        Interview intArunMs = Interview.builder()
                .application(appArunMs)
                .student(sArun)
                .company(microsoft)
                .jobDrive(dMicrosoft)
                .round(InterviewRound.TECHNICAL_INTERVIEW_2)
                .interviewDate(LocalDate.now().minusDays(5))
                .interviewTime("11:00 AM")
                .mode(InterviewMode.ONLINE)
                .venueOrLink("https://teams.microsoft.com/l/meetup-join/ms-placement-arun")
                .status(InterviewStatus.COMPLETED)
                .feedback("Strong understanding of concurrent systems and algorithms.")
                .interviewerName("Siddharth Roy")
                .build();
        interviewRepository.save(intArunMs);

        Offer offerArunMs = Offer.builder()
                .student(sArun)
                .company(microsoft)
                .jobDrive(dMicrosoft)
                .application(appArunMs)
                .ctc(new BigDecimal("18.50"))
                .offerDate(LocalDate.now().minusDays(3))
                .joiningDate(LocalDate.of(2025, 7, 1))
                .status(OfferStatus.ACCEPTED)
                .remarks("Offer accepted by student. Welcome to Microsoft!")
                .build();
        offerRepository.save(offerArunMs);

        // Arun also applied to Google (Allowed because Google 24 LPA is Dream Company >= 12 LPA threshold)
        Application appArunGoogle = Application.builder()
                .student(sArun)
                .jobDrive(dGoogle)
                .status(ApplicationStatus.INTERVIEW_SCHEDULED)
                .notes("Candidate cleared initial screening. Scheduled for Tech Round 1.")
                .build();
        appArunGoogle = applicationRepository.save(appArunGoogle);

        Interview intArunGoogle = Interview.builder()
                .application(appArunGoogle)
                .student(sArun)
                .company(google)
                .jobDrive(dGoogle)
                .round(InterviewRound.TECHNICAL_INTERVIEW_1)
                .interviewDate(LocalDate.now().plusDays(2))
                .interviewTime("02:30 PM")
                .mode(InterviewMode.ONLINE)
                .venueOrLink("https://meet.google.com/abc-defg-hij")
                .status(InterviewStatus.SCHEDULED)
                .interviewerName("Dev Team Leads")
                .build();
        interviewRepository.save(intArunGoogle);

        // Karthik applied to Google -> Selected -> Offered -> ACCEPTED
        Application appKarthikGoogle = Application.builder()
                .student(sKarthik)
                .jobDrive(dGoogle)
                .status(ApplicationStatus.OFFER_ACCEPTED)
                .notes("Top coder rank in college. Cleared all 4 rounds flawlessly.")
                .build();
        appKarthikGoogle = applicationRepository.save(appKarthikGoogle);

        Offer offerKarthik = Offer.builder()
                .student(sKarthik)
                .company(google)
                .jobDrive(dGoogle)
                .application(appKarthikGoogle)
                .ctc(new BigDecimal("24.00"))
                .offerDate(LocalDate.now().minusDays(2))
                .joiningDate(LocalDate.of(2025, 7, 15))
                .status(OfferStatus.ACCEPTED)
                .remarks("High-priority offer accepted.")
                .build();
        offerRepository.save(offerKarthik);

        // Priya applied to Amazon -> Offered -> ACCEPTED
        Application appPriyaAmazon = Application.builder()
                .student(sPriya)
                .jobDrive(dAmazon)
                .status(ApplicationStatus.OFFER_ACCEPTED)
                .notes("Cleared Online Assessment and Bar Raiser.")
                .build();
        appPriyaAmazon = applicationRepository.save(appPriyaAmazon);

        Offer offerPriya = Offer.builder()
                .student(sPriya)
                .company(amazon)
                .jobDrive(dAmazon)
                .application(appPriyaAmazon)
                .ctc(new BigDecimal("16.00"))
                .offerDate(LocalDate.now().minusDays(4))
                .joiningDate(LocalDate.of(2025, 8, 1))
                .status(OfferStatus.ACCEPTED)
                .remarks("Offer accepted.")
                .build();
        offerRepository.save(offerPriya);

        // Rahul (with 1 backlog) applied to TCS -> SHORTLISTED
        Application appRahulTcs = Application.builder()
                .student(sRahul)
                .jobDrive(dTcs)
                .status(ApplicationStatus.SHORTLISTED)
                .notes("Profile reviewed. Eligible under 1 backlog policy.")
                .build();
        applicationRepository.save(appRahulTcs);

        // Sneha applied to TCS -> UNDER_REVIEW
        Application appSnehaTcs = Application.builder()
                .student(sSneha)
                .jobDrive(dTcs)
                .status(ApplicationStatus.UNDER_REVIEW)
                .notes("Under HR screening.")
                .build();
        applicationRepository.save(appSnehaTcs);

        log.info("Database seeding successfully completed!");
    }
}
