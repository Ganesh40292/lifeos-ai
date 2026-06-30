package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response payload returning the AI assistant answer and mode info.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String response;
    private String sourceMode; // "LIVE_GEMINI" or "LOCAL_FALLBACK"
}
