package com.lifeos.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response exposing Budget data.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private UUID id;
    private String category;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount; // dynamically calculated spent amount for the category
    private Integer month;
    private Integer year;
}
