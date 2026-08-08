package com.lifeos.service;

import com.lifeos.dto.request.LoginRequest;
import com.lifeos.dto.request.RegisterRequest;
import com.lifeos.dto.response.AuthResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.entity.User;
import com.lifeos.exception.EmailAlreadyExistsException;
import com.lifeos.repository.UserRepository;
import com.lifeos.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service handling user registration and login business logic.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final com.lifeos.repository.UserSessionRepository userSessionRepository;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuthenticationManager authenticationManager,
                       UserService userService,
                       com.lifeos.repository.UserSessionRepository userSessionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.userSessionRepository = userSessionRepository;
    }

    /**
     * Register a new user account.
     * Validates email uniqueness, hashes the password, saves the user,
     * and returns a JWT token with user profile.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request, String ipAddress, String device) {
        // Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        // Build and save new user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);

        // Generate JWT
        String token = jwtTokenProvider.generateTokenFromEmail(savedUser.getEmail());
        saveSession(savedUser, token, device, ipAddress);
        UserResponse userResponse = userService.mapToResponse(savedUser);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String device) {
        // Authenticate via Spring Security AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isTwoFactorEnabled()) {
            // Generate temporary JWT token for 2FA validation stage
            String tempToken = jwtTokenProvider.generateTokenFromEmail("TEMP:" + user.getEmail());
            return AuthResponse.builder()
                    .twoFactorRequired(true)
                    .tempSessionToken(tempToken)
                    .build();
        }

        // Generate JWT
        String token = jwtTokenProvider.generateToken(authentication);
        saveSession(user, token, device, ipAddress);

        UserResponse userResponse = userService.mapToResponse(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userResponse)
                .build();
    }

    @Transactional
    public AuthResponse loginOrRegisterGoogle(String email, String fullName, String avatar, String ipAddress, String device) {
        String cleanEmail = email.toLowerCase().trim();
        String safeAvatar = (avatar != null && avatar.length() > 490) ? avatar.substring(0, 490) : avatar;

        User user = userRepository.findByEmail(cleanEmail)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .fullName(fullName != null && !fullName.isEmpty() ? fullName : "Google User")
                            .email(cleanEmail)
                            .password(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                            .avatar(safeAvatar)
                            .build();
                    return userRepository.save(newUser);
                });

        if (safeAvatar != null && !safeAvatar.isEmpty() && (user.getAvatar() == null || user.getAvatar().isEmpty())) {
            user.setAvatar(safeAvatar);
            user = userRepository.save(user);
        }

        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        saveSession(user, token, device, ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userService.mapToResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse verify2FaLogin(String tempToken, int code, String ipAddress, String device) {
        if (!jwtTokenProvider.validateToken(tempToken)) {
            throw new RuntimeException("Invalid or expired login session");
        }

        String subject = jwtTokenProvider.getEmailFromToken(tempToken);
        if (subject == null || !subject.startsWith("TEMP:")) {
            throw new RuntimeException("Invalid temporary token");
        }

        String email = subject.substring(5);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!com.lifeos.security.TotpUtils.verifyCode(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid 2FA verification code");
        }

        // Verify successful -> generate final token and start session
        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        saveSession(user, token, device, ipAddress);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userService.mapToResponse(user))
                .build();
    }

    @Transactional
    public com.lifeos.dto.response.TwoFactorSetupResponse setup2Fa(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String secret = user.getTwoFactorSecret();
        if (secret == null || secret.isEmpty()) {
            secret = com.lifeos.security.TotpUtils.generateSecretKey();
            user.setTwoFactorSecret(secret);
            userRepository.save(user);
        }

        String otpauthUri = com.lifeos.security.TotpUtils.getOtpauthUri(user.getEmail(), secret);
        String qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + 
                java.net.URLEncoder.encode(otpauthUri, java.nio.charset.StandardCharsets.UTF_8);

        return com.lifeos.dto.response.TwoFactorSetupResponse.builder()
                .secretKey(secret)
                .qrCodeUrl(qrCodeUrl)
                .otpauthUri(otpauthUri)
                .build();
    }

    @Transactional
    public void enable2Fa(String userEmail, int code) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTwoFactorSecret() == null) {
            throw new RuntimeException("2FA secret has not been set up yet");
        }

        if (!com.lifeos.security.TotpUtils.verifyCode(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void disable2Fa(String userEmail, int code) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!com.lifeos.security.TotpUtils.verifyCode(user.getTwoFactorSecret(), code)) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.lifeos.dto.response.UserSessionResponse> getActiveSessions(String userEmail, String currentToken) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentTokenHash = currentToken != null ? JwtTokenProvider.hashToken(currentToken) : null;
        java.util.List<com.lifeos.entity.UserSession> sessions = userSessionRepository.findByUserIdOrderByLastActiveDesc(user.getId());

        java.util.List<com.lifeos.dto.response.UserSessionResponse> response = new java.util.ArrayList<>();
        for (com.lifeos.entity.UserSession s : sessions) {
            response.add(com.lifeos.dto.response.UserSessionResponse.builder()
                    .id(s.getId())
                    .device(s.getDevice())
                    .ipAddress(s.getIpAddress())
                    .lastActive(s.getLastActive())
                    .isCurrentSession(s.getTokenHash().equals(currentTokenHash))
                    .build());
        }
        return response;
    }

    @Transactional
    public void revokeSession(java.util.UUID sessionId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.lifeos.entity.UserSession session = userSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized session revocation");
        }

        userSessionRepository.delete(session);
    }

    @Transactional
    public void revokeSessionByToken(String token) {
        String tokenHash = JwtTokenProvider.hashToken(token);
        userSessionRepository.deleteByTokenHash(tokenHash);
    }

    private void saveSession(User user, String token, String device, String ipAddress) {
        String tokenHash = JwtTokenProvider.hashToken(token);
        com.lifeos.entity.UserSession session = com.lifeos.entity.UserSession.builder()
                .user(user)
                .tokenHash(tokenHash)
                .device(device != null ? device : "Unknown Device")
                .ipAddress(ipAddress != null ? ipAddress : "Unknown IP")
                .lastActive(java.time.LocalDateTime.now())
                .build();
        userSessionRepository.save(session);
    }
}
