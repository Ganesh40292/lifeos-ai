package com.lifeos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for creating or updating a Note.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteRequest {

    @NotBlank(message = "Note title is required")
    @Size(max = 200, message = "Note title cannot exceed 200 characters")
    private String title;

    private String content;

    @NotBlank(message = "Folder is required")
    @Size(max = 100, message = "Folder name cannot exceed 100 characters")
    private String folder;

    @Size(max = 255, message = "Tags cannot exceed 255 characters")
    private String tags;

    private Boolean pinned;
}
