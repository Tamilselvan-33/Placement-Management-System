package com.placement.management.service.impl;

import com.placement.management.dto.request.CompanyRegisterRequest;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.dto.request.StudentRegisterRequest;
import com.placement.management.dto.response.AuthResponse;
import com.placement.management.entity.Company;
import com.placement.management.entity.Student;
import com.placement.management.entity.User;
import com.placement.management.enums.PlacementStatus;
import com.placement.management.enums.Role;
import com.placement.management.exception.BadRequestException;
import com.placement.management.exception.ConflictException;
import com.placement.management.repository.CompanyRepository;
import com.placement.management.repository.StudentRepository;
import com.placement.management.repository.UserRepository;
import com.placement.management.security.JwtTokenProvider;
import com.placement.management.security.UserPrincipal;
import com.placement.management.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Override
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

        Long profileId = null;
        if (userPrincipal.getRole() == Role.ROLE_STUDENT) {
            profileId = studentRepository.findByUserId(userPrincipal.getId())
                    .map(Student::getId).orElse(null);
        } else if (userPrincipal.getRole() == Role.ROLE_COMPANY) {
            profileId = companyRepository.findByUserId(userPrincipal.getId())
                    .map(Company::getId).orElse(null);
        }

        return AuthResponse.builder()
                .token(jwt)
                .userId(userPrincipal.getId())
                .email(userPrincipal.getEmail())
                .fullName(userPrincipal.getFullName())
                .role(userPrincipal.getRole())
                .profileId(profileId)
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }
        if (studentRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ConflictException("Registration number is already registered: " + request.getRegistrationNumber());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phone(request.getPhone())
                .role(Role.ROLE_STUDENT)
                .active(true)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .registrationNumber(request.getRegistrationNumber().trim().toUpperCase())
                .department(request.getDepartment().trim().toUpperCase())
                .degree(request.getDegree() != null ? request.getDegree() : "B.Tech")
                .graduationYear(request.getGraduationYear())
                .cgpa(request.getCgpa() != null ? request.getCgpa() : BigDecimal.ZERO)
                .backlogs(request.getBacklogs() != null ? request.getBacklogs() : 0)
                .placementStatus(PlacementStatus.UNPLACED)
                .active(true)
                .build();
        student = studentRepository.save(student);

        // Auto authenticate and generate token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(user), null, UserPrincipal.create(user).getAuthorities()
        );
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .profileId(student.getId())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse registerCompany(CompanyRegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }
        if (companyRepository.existsByCompanyEmail(request.getEmail())) {
            throw new ConflictException("Company email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getCompanyName().trim())
                .phone(request.getContactPhone())
                .role(Role.ROLE_COMPANY)
                .active(true)
                .build();
        user = userRepository.save(user);

        Company company = Company.builder()
                .user(user)
                .companyName(request.getCompanyName().trim())
                .companyEmail(request.getEmail().toLowerCase().trim())
                .contactPerson(request.getContactPerson().trim())
                .contactPhone(request.getContactPhone())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .website(request.getWebsite())
                .description(request.getDescription())
                .verified(true)
                .build();
        company = companyRepository.save(company);

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                UserPrincipal.create(user), null, UserPrincipal.create(user).getAuthorities()
        );
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(company.getCompanyName())
                .role(user.getRole())
                .profileId(company.getId())
                .build();
    }

    @Override
    public AuthResponse getCurrentUserResponse(User user) {
        Long profileId = null;
        if (user.getRole() == Role.ROLE_STUDENT) {
            profileId = studentRepository.findByUserId(user.getId())
                    .map(Student::getId).orElse(null);
        } else if (user.getRole() == Role.ROLE_COMPANY) {
            profileId = companyRepository.findByUserId(user.getId())
                    .map(Company::getId).orElse(null);
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .profileId(profileId)
                .build();
    }
}
