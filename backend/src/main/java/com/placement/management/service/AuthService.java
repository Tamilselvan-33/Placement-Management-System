package com.placement.management.service;

import com.placement.management.dto.request.CompanyRegisterRequest;
import com.placement.management.dto.request.LoginRequest;
import com.placement.management.dto.request.StudentRegisterRequest;
import com.placement.management.dto.response.AuthResponse;
import com.placement.management.entity.User;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse registerStudent(StudentRegisterRequest request);
    AuthResponse registerCompany(CompanyRegisterRequest request);
    AuthResponse getCurrentUserResponse(User currentUser);
}
