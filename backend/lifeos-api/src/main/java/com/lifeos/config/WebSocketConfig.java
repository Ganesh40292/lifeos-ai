package com.lifeos.config;

import com.lifeos.repository.UserRepository;
import com.lifeos.security.CustomUserDetailsService;
import com.lifeos.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.config.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

/**
 * Enterprise WebSocket configuration using STOMP over SockJS.
 * Enforces JWT session authentication on CONNECT, subscription authorization for /topic/notifications/{userId},
 * and restricted CORS origin patterns aligned with FRONTEND_URL.
 */
@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String frontendUrl = System.getenv("FRONTEND_URL");
        List<String> allowedOrigins = new ArrayList<>(List.of(
                "http://localhost:5173",
                "http://localhost:3000",
                "https://*.vercel.app"
        ));
        if (StringUtils.hasText(frontendUrl)) {
            allowedOrigins.add(frontendUrl.trim().replaceAll("/+$", ""));
        }

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.toArray(new String[0]))
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;

                // 1. Authenticate STOMP CONNECT Command
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        if (jwtTokenProvider.validateToken(token)) {
                            String email = jwtTokenProvider.getEmailFromToken(token);
                            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                            UsernamePasswordAuthenticationToken auth =
                                    new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(auth);
                        }
                    }
                }

                // 2. Authorize STOMP SUBSCRIBE Command
                if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                    Principal principal = accessor.getUser();
                    if (principal == null) {
                        throw new AccessDeniedException("Unauthorized: Authentication required to subscribe to STOMP channels");
                    }

                    String destination = accessor.getDestination();
                    if (destination != null && destination.startsWith("/topic/notifications/")) {
                        String targetUserIdStr = destination.substring("/topic/notifications/".length());
                        userRepository.findByEmail(principal.getName()).ifPresent(user -> {
                            if (!user.getId().toString().equalsIgnoreCase(targetUserIdStr)) {
                                throw new AccessDeniedException("Access Denied: You are not authorized to subscribe to another user's notification topic");
                            }
                        });
                    }
                }

                return message;
            }
        });
    }
}
