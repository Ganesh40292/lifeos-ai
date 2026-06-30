package com.lifeos.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TwoFactorSetupResponse {
    private String secretKey;
    private String qrCodeUrl;
    private String otpauthUri;
}
