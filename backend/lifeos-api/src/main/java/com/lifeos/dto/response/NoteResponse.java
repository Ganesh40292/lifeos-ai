package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response exposing Note data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoteResponse {
    private UUID id;
    private String title;
    private String content;
    private String folder;
    private String tags;
    private boolean pinned;
    private String filePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
