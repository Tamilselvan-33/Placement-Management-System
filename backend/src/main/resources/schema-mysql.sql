-- =========================================================================
-- CAMPUS PLACEMENT MANAGEMENT SYSTEM - MYSQL SCHEMA
-- Database: MySQL 8.0+
-- =========================================================================

CREATE DATABASE IF NOT EXISTS campus_placement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_placement;

-- 1. Placement Policies Table
CREATE TABLE IF NOT EXISTS placement_policies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_name VARCHAR(100) NOT NULL,
    max_offers_allowed INT NOT NULL DEFAULT 1,
    allow_applications_after_acceptance BOOLEAN NOT NULL DEFAULT FALSE,
    dream_company_ctc_threshold DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
    allow_dream_company_participation BOOLEAN NOT NULL DEFAULT TRUE,
    min_cgpa_default DECIMAL(4, 2) DEFAULT 6.00,
    max_backlogs_default INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    degree VARCHAR(50) DEFAULT 'B.Tech',
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4, 2) DEFAULT 0.00,
    backlogs INT NOT NULL DEFAULT 0,
    technical_skills TEXT,
    programming_languages TEXT,
    projects TEXT,
    certifications TEXT,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    placement_status VARCHAR(30) NOT NULL DEFAULT 'UNPLACED',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_reg_no (registration_number),
    INDEX idx_student_dept (department),
    INDEX idx_student_grad_year (graduation_year),
    INDEX idx_student_placement_status (placement_status)
) ENGINE=InnoDB;

-- 4. Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    company_email VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(200),
    industry VARCHAR(100),
    location VARCHAR(150),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    logo_url VARCHAR(255),
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_company_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_company_name (company_name),
    INDEX idx_company_email (company_email),
    INDEX idx_company_industry (industry)
) ENGINE=InnoDB;

-- 5. Job Drives Table
CREATE TABLE IF NOT EXISTS job_drives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_description TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    eligible_departments VARCHAR(255) NOT NULL,
    minimum_cgpa DECIMAL(4, 2) NOT NULL,
    max_backlogs INT NOT NULL DEFAULT 0,
    graduation_year INT NOT NULL,
    salary_package DECIMAL(10, 2) NOT NULL,
    job_location VARCHAR(150) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full Time',
    opening_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_drive_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_drive_company (company_id),
    INDEX idx_drive_status (status),
    INDEX idx_drive_deadline (application_deadline)
) ENGINE=InnoDB;

-- 6. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    job_drive_id BIGINT NOT NULL,
    application_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_drive UNIQUE (student_id, job_drive_id),
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_drive FOREIGN KEY (job_drive_id) REFERENCES job_drives(id) ON DELETE CASCADE,
    INDEX idx_app_student (student_id),
    INDEX idx_app_drive (job_drive_id),
    INDEX idx_app_status (status)
) ENGINE=InnoDB;

-- 7. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    job_drive_id BIGINT NOT NULL,
    round VARCHAR(40) NOT NULL,
    interview_date DATE NOT NULL,
    interview_time VARCHAR(20) NOT NULL,
    mode VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    venue_or_link VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',
    feedback TEXT,
    interviewer_name VARCHAR(100),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interview_app FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_interview_drive FOREIGN KEY (job_drive_id) REFERENCES job_drives(id) ON DELETE CASCADE,
    INDEX idx_interview_app (application_id),
    INDEX idx_interview_student (student_id),
    INDEX idx_interview_company (company_id),
    INDEX idx_interview_date (interview_date)
) ENGINE=InnoDB;

-- 8. Offers Table
CREATE TABLE IF NOT EXISTS offers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    company_id BIGINT NOT NULL,
    job_drive_id BIGINT NOT NULL,
    application_id BIGINT NOT NULL UNIQUE,
    ctc DECIMAL(10, 2) NOT NULL,
    offer_date DATE NOT NULL,
    joining_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    remarks TEXT,
    offer_letter_url VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_offer_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_drive FOREIGN KEY (job_drive_id) REFERENCES job_drives(id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_application FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    INDEX idx_offer_student (student_id),
    INDEX idx_offer_company (company_id),
    INDEX idx_offer_status (status)
) ENGINE=InnoDB;

-- 9. Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL UNIQUE,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resume_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB;

