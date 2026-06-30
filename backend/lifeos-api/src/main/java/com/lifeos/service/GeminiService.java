package com.lifeos.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeos.dto.response.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service facilitating contextual AI interactions using Google Gemini API
 * with a comprehensive local regex-driven fallback engine.
 */
@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private final NoteService noteService;
    private final FinanceService financeService;
    private final HabitService habitService;
    private final StudentService studentService;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    public ChatResponse chat(UUID userId, String userQuery) {
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getProperty("GEMINI_API_KEY");
        }

        // Aggregate User Data Context
        String contextData = aggregateContext(userId);

        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String aiResponse = queryGemini(apiKey, contextData, userQuery);
                return new ChatResponse(aiResponse, "LIVE_GEMINI");
            } catch (Exception e) {
                log.error("Failed to query Gemini API, falling back to local processing", e);
            }
        }

        // Use smart local fallback
        String fallbackResponse = localFallbackQuery(contextData, userQuery, userId);
        return new ChatResponse(fallbackResponse, "LOCAL_FALLBACK");
    }

    private String queryGemini(String apiKey, String contextData, String userQuery) throws Exception {
        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        // System prompt and context injected alongside query
        String prompt = "System Context & Instructions:\n" +
                "You are LifeOS Copilot, the AI assistant for 'LifeOS', a personal management system.\n" +
                "You have access to the user's real-time aggregated life context below.\n" +
                "Answer the user's question accurately, referencing their notes, finances, habits, and academic schedules if relevant.\n" +
                "Use clean markdown formatting, including bold keywords, lists, and markdown tables where appropriate.\n" +
                "Keep responses professional, encouraging, and focused on helping the user stay productive.\n\n" +
                "--- START USER CONTEXT ---\n" +
                contextData + "\n" +
                "--- END USER CONTEXT ---\n\n" +
                "User Question: " + userQuery;

        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> partsContainer = Map.of("parts", List.of(part));
        Map<String, Object> payload = Map.of("contents", List.of(partsContainer));

        String requestBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(GEMINI_API_URL + apiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .timeout(Duration.ofSeconds(15))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error, HTTP Status: " + response.statusCode() + ", Response: " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidate = root.path("candidates").get(0);
        if (candidate != null) {
            JsonNode textNode = candidate.path("content").path("parts").get(0).path("text");
            if (!textNode.isMissingNode()) {
                return textNode.asText();
            }
        }

        throw new RuntimeException("Unexpected response format from Gemini API");
    }

    private String aggregateContext(UUID userId) {
        StringBuilder sb = new StringBuilder();

        // 1. Notes Context
        try {
            List<NoteResponse> notes = noteService.getNotes(userId);
            sb.append("### Active Notes (Latest 5):\n");
            if (notes.isEmpty()) {
                sb.append("- No active notes.\n");
            } else {
                notes.stream().limit(5).forEach(n -> sb.append(String.format("- **Title**: %s | **Folder**: %s | **Tags**: [%s]\n  *Content*: %s\n",
                        n.getTitle(), n.getFolder(), n.getTags(), n.getContent())));
            }
        } catch (Exception e) {
            sb.append("### Active Notes:\n- Error fetching notes context.\n");
        }
        sb.append("\n");

        // 2. Finance Context
        try {
            LocalDate now = LocalDate.now();
            List<BudgetResponse> budgets = financeService.getBudgets(userId, now.getMonthValue(), now.getYear());
            List<TransactionResponse> transactions = financeService.getTransactions(userId);

            sb.append(String.format("### Finance Status (Month: %d, Year: %d):\n", now.getMonthValue(), now.getYear()));
            sb.append("**Active Budgets**:\n");
            if (budgets.isEmpty()) {
                sb.append("- No budgets set for this month.\n");
            } else {
                budgets.forEach(b -> sb.append(String.format("- **Category**: %s | **Limit**: $%s | **Spent**: $%s\n",
                        b.getCategory(), b.getLimitAmount(), b.getSpentAmount())));
            }

            sb.append("**Recent Transactions (Latest 5)**:\n");
            if (transactions.isEmpty()) {
                sb.append("- No transactions recorded.\n");
            } else {
                transactions.stream().limit(5).forEach(t -> sb.append(String.format("- **Category**: %s | **Type**: %s | **Amount**: $%s | **Desc**: %s | **Date**: %s\n",
                        t.getCategory(), t.getType(), t.getAmount(), t.getDescription(), t.getDate())));
            }
        } catch (Exception e) {
            sb.append("### Finance Status:\n- Error fetching finance context.\n");
        }
        sb.append("\n");

        // 3. Habits Context
        try {
            List<HabitResponse> habits = habitService.getHabits(userId);
            sb.append("### Habit Tracker & Streaks:\n");
            if (habits.isEmpty()) {
                sb.append("- No habits defined.\n");
            } else {
                habits.forEach(h -> sb.append(String.format("- **Habit**: %s | **Streak**: %d days | **Completed Today**: %s\n",
                        h.getName(), h.getStreakDays(), h.isCompletedToday() ? "Yes" : "No")));
            }
        } catch (Exception e) {
            sb.append("### Habit Tracker:\n- Error fetching habits context.\n");
        }
        sb.append("\n");

        // 4. Academics Context
        try {
            List<SubjectResponse> subjects = studentService.getSubjects(userId);
            List<AssignmentResponse> assignments = studentService.getAssignments(userId);

            sb.append("### Academics (Subjects & Assignments):\n");
            sb.append("**Current Subjects**:\n");
            if (subjects.isEmpty()) {
                sb.append("- No subjects registered.\n");
            } else {
                subjects.forEach(s -> sb.append(String.format("- **%s** (%s) | **Attendance**: %d/%d (%.1f%%) | **Credits**: %d\n",
                        s.getName(), s.getCode(), s.getAttendedClasses(), s.getTotalClasses(), s.getAttendancePercentage(), s.getCredits())));
            }

            sb.append("**Pending/Recent Assignments**:\n");
            if (assignments.isEmpty()) {
                sb.append("- No assignments assigned.\n");
            } else {
                assignments.stream()
                        .filter(a -> !"SUBMITTED".equalsIgnoreCase(a.getStatus()))
                        .limit(5)
                        .forEach(a -> sb.append(String.format("- **%s** for %s | **Due**: %s | **Status**: %s | **Priority**: %s\n",
                                a.getTitle(), a.getSubjectName(), a.getDueDate(), a.getStatus(), a.getPriority())));
            }
        } catch (Exception e) {
            sb.append("### Academics:\n- Error fetching academics context.\n");
        }

        return sb.toString();
    }

    private String localFallbackQuery(String contextData, String query, UUID userId) {
        String lcQuery = query.toLowerCase();

        boolean noteMention = Pattern.compile("(?i)\\b(note|docs?|write|read)\\b").matcher(lcQuery).find();
        boolean financeMention = Pattern.compile("(?i)\\b(money|budget|spend|cost|expense|finance|cash|ledger|transaction)\\b").matcher(lcQuery).find();
        boolean habitMention = Pattern.compile("(?i)\\b(habit|streak|routine|daily|completed)\\b").matcher(lcQuery).find();
        boolean academicMention = Pattern.compile("(?i)\\b(assignment|study|class|subject|course|grade|schedule|timetable|deadline|homework)\\b").matcher(lcQuery).find();

        StringBuilder res = new StringBuilder();
        res.append("⚡ **LifeOS Local AI Engine Active**\n\n");
        res.append("Your request was processed offline/locally. Here is the relevant summary matching your query:\n\n");

        if (noteMention) {
            res.append("### 📝 Notes Summary\n");
            try {
                List<NoteResponse> notes = noteService.getNotes(userId);
                if (notes.isEmpty()) {
                    res.append("You have no notes active. Create notes inside the notes tab to view them here.\n");
                } else {
                    res.append("| Title | Folder | Tags |\n|---|---|---|\n");
                    notes.stream().limit(5).forEach(n -> res.append(String.format("| %s | %s | %s |\n", n.getTitle(), n.getFolder(), n.getTags())));
                    res.append("\n_Showing top 5 active notes._\n");
                }
            } catch (Exception e) {
                res.append("_Error loading notes local context._\n");
            }
            res.append("\n");
        }

        if (financeMention) {
            res.append("### 💸 Finance Dashboard Snapshot\n");
            try {
                LocalDate now = LocalDate.now();
                List<BudgetResponse> budgets = financeService.getBudgets(userId, now.getMonthValue(), now.getYear());
                if (budgets.isEmpty()) {
                    res.append("No active budgets found for this month.\n");
                } else {
                    res.append("| Category | Limit Amount | Spent Amount |\n|---|---|---|\n");
                    budgets.forEach(b -> res.append(String.format("| %s | $%s | $%s |\n", b.getCategory(), b.getLimitAmount(), b.getSpentAmount())));
                }
            } catch (Exception e) {
                res.append("_Error loading budgets context._\n");
            }
            res.append("\n");
        }

        if (habitMention) {
            res.append("### 🔥 Habit tracker Streaks\n");
            try {
                List<HabitResponse> habits = habitService.getHabits(userId);
                if (habits.isEmpty()) {
                    res.append("No habits defined yet. Start tracking a new habit to build daily streaks!\n");
                } else {
                    res.append("| Habit Name | Active Streak | Completed Today |\n|---|---|---|\n");
                    habits.forEach(h -> res.append(String.format("| %s | %d days | %s |\n", h.getName(), h.getStreakDays(), h.isCompletedToday() ? "✅ Yes" : "❌ No")));
                }
            } catch (Exception e) {
                res.append("_Error loading habits context._\n");
            }
            res.append("\n");
        }

        if (academicMention) {
            res.append("### 🎓 Academics & Study Deadlines\n");
            try {
                List<AssignmentResponse> assignments = studentService.getAssignments(userId);
                List<AssignmentResponse> active = assignments.stream()
                        .filter(a -> !"SUBMITTED".equalsIgnoreCase(a.getStatus()))
                        .collect(Collectors.toList());

                if (active.isEmpty()) {
                    res.append("No upcoming assignments scheduled. Great job keeping your plate clean!\n");
                } else {
                    res.append("| Assignment | Course | Due Date | Priority | Status |\n|---|---|---|---|---|\n");
                    active.stream().limit(5).forEach(a -> res.append(String.format("| %s | %s | %s | %s | %s |\n",
                            a.getTitle(), a.getSubjectName(), a.getDueDate(), a.getPriority(), a.getStatus())));
                }
            } catch (Exception e) {
                res.append("_Error loading assignment schedules._\n");
            }
            res.append("\n");
        }

        // Generic Summary if no specific module matched
        if (!noteMention && !financeMention && !habitMention && !academicMention) {
            res.append("Here is a quick overview of your LifeOS items:\n\n");

            // Simple summaries
            try {
                List<HabitResponse> habits = habitService.getHabits(userId);
                long done = habits.stream().filter(HabitResponse::isCompletedToday).count();
                res.append(String.format("- **Habits today**: %d/%d completed.\n", done, habits.size()));
            } catch (Exception ignored) {}

            try {
                List<AssignmentResponse> assignments = studentService.getAssignments(userId);
                long pending = assignments.stream().filter(a -> !"SUBMITTED".equalsIgnoreCase(a.getStatus())).count();
                res.append(String.format("- **Pending academic deliverables**: %d assignments.\n", pending));
            } catch (Exception ignored) {}

            try {
                List<NoteResponse> notes = noteService.getNotes(userId);
                res.append(String.format("- **Stored notes**: %d documents.\n", notes.size()));
            } catch (Exception ignored) {}

            res.append("\n_Try asking me about specific modules (e.g. \"check my budgets\", \"summarize notes\", or \"list my habits\") to get drilldown reports!_");
        }

        return res.toString();
    }
}
