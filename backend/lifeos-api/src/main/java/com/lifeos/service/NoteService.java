package com.lifeos.service;

import com.lifeos.dto.request.NoteRequest;
import com.lifeos.dto.response.NoteResponse;
import com.lifeos.entity.Note;
import com.lifeos.exception.ResourceNotFoundException;
import com.lifeos.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service orchestrating Note module business logic.
 */
@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final GamificationService gamificationService;

    @Transactional(readOnly = true)
    public List<NoteResponse> getNotes(UUID userId) {
        return noteRepository.findAllByUserIdOrderByPinnedDescUpdatedAtDesc(userId).stream()
                .map(this::mapToNoteResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteResponse getNoteById(UUID userId, UUID noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        return mapToNoteResponse(note);
    }

    @Transactional
    public NoteResponse addNote(UUID userId, NoteRequest request) {
        String baseTags = request.getTags() != null ? request.getTags() : "";
        String smartTags = autoTagNote(request.getTitle(), request.getContent() != null ? request.getContent() : "", baseTags);

        Note note = Note.builder()
                .userId(userId)
                .title(request.getTitle())
                .content(request.getContent() != null ? request.getContent() : "")
                .folder(request.getFolder() != null ? request.getFolder() : "General")
                .tags(smartTags)
                .pinned(request.getPinned() != null ? request.getPinned() : false)
                .build();
        Note saved = noteRepository.save(note);
        gamificationService.awardXp(userId, GamificationService.ActivityType.ADD_NOTE);
        return mapToNoteResponse(saved);
    }

    @Transactional
    public NoteResponse updateNote(UUID userId, UUID noteId, NoteRequest request) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));

        note.setTitle(request.getTitle());
        note.setContent(request.getContent() != null ? request.getContent() : "");
        note.setFolder(request.getFolder() != null ? request.getFolder() : "General");
        
        String baseTags = request.getTags() != null ? request.getTags() : "";
        String smartTags = autoTagNote(request.getTitle(), request.getContent() != null ? request.getContent() : "", baseTags);
        note.setTags(smartTags);
        
        if (request.getPinned() != null) {
            note.setPinned(request.getPinned());
        }

        return mapToNoteResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(UUID userId, UUID noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        noteRepository.delete(note);
    }

    @Transactional
    public NoteResponse togglePinNote(UUID userId, UUID noteId) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        note.setPinned(!note.isPinned());
        return mapToNoteResponse(noteRepository.save(note));
    }

    private String autoTagNote(String title, String content, String existingTags) {
        java.util.Set<String> tags = new java.util.LinkedHashSet<>();
        
        // Parse existing tags
        if (existingTags != null && !existingTags.trim().isEmpty()) {
            for (String tag : existingTags.split(",")) {
                if (!tag.trim().isEmpty()) {
                    tags.add(tag.trim());
                }
            }
        }
        
        String combined = ((title != null ? title : "") + " " + (content != null ? content : "")).toLowerCase();
        
        // Check academic
        if (combined.contains("homework") || combined.contains("assignment") || combined.contains("exam") ||
            combined.contains("lecture") || combined.contains("professor") || combined.contains("subject") ||
            combined.contains("class") || combined.contains("syllabus") || combined.contains("study") ||
            combined.contains("quiz") || combined.contains("midterm") || combined.contains("grade")) {
            tags.add("Academic");
        }
        
        // Check health
        if (combined.contains("workout") || combined.contains("gym") || combined.contains("calories") ||
            combined.contains("water") || combined.contains("sleep") || combined.contains("fitness") ||
            combined.contains("diet") || combined.contains("running") || combined.contains("exercise") ||
            combined.contains("health") || combined.contains("protein") || combined.contains("cardio")) {
            tags.add("Health");
        }
        
        // Check finance
        if (combined.contains("budget") || combined.contains("expense") || combined.contains("spent") ||
            combined.contains("income") || combined.contains("salary") || combined.contains("price") ||
            combined.contains("cost") || combined.contains("money") || combined.contains("savings") ||
            combined.contains("transaction") || combined.contains("debt") || combined.contains("bank")) {
            tags.add("Finance");
        }
        
        // Check career
        if (combined.contains("interview") || combined.contains("job") || combined.contains("resume") ||
            combined.contains("internship") || combined.contains("application") || combined.contains("career") ||
            combined.contains("offer") || combined.contains("linkedin") || combined.contains("hr") ||
            combined.contains("recruiter")) {
            tags.add("Career");
        }
        
        return String.join(",", tags);
    }

    private NoteResponse mapToNoteResponse(Note note) {
        return NoteResponse.builder()
                .id(note.getId())
                .title(note.getTitle())
                .content(note.getContent())
                .folder(note.getFolder())
                .tags(note.getTags())
                .pinned(note.isPinned())
                .filePath(note.getFilePath())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }

    @Transactional
    public NoteResponse updateNoteFilePath(UUID userId, UUID noteId, String filePath) {
        Note note = noteRepository.findByIdAndUserId(noteId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        note.setFilePath(filePath);
        return mapToNoteResponse(noteRepository.save(note));
    }
}
