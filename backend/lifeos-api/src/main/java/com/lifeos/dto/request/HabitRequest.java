package com.lifeos.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitRequest {

    @NotBlank(message = "Habit name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    private String description;
}
