package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {
    private UUID id;
    private String name;
    private String company;
    private String position;
    private String email;
    private String phone;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
