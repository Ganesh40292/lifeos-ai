package com.lifeos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Transaction entity representing a financial income or expense.
 */
@Entity
@Table(name = "transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    private String type; // INCOME, EXPENSE

    @Column(nullable = false, length = 50)
    private String category; // Food, Rent, Salary, Utilities, Leisure, Transport, Other

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private LocalDate date;
}
