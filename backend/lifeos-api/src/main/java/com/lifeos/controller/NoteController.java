package com.lifeos.controller;

import com.lifeos.dto.request.NoteRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.NoteResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.FileStorageService;
import com.lifeos.service.NoteService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for Note Module endpoints.
 */
@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;
    private final FileStorageService fileStorageService;

    private UUID getUserId(Authentication authentication) {
        UserResponse user = userService.getUserByEmail(authentication.getName());
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NoteResponse>>> getNotes(Authentication authentication) {
        List<NoteResponse> responses = noteService.getNotes(getUserId(authentication));
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> getNoteById(
            Authentication authentication,
            @PathVariable UUID id) {
        NoteResponse response = noteService.getNoteById(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NoteResponse>> addNote(
            Authentication authentication,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse response = noteService.addNote(getUserId(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteResponse>> updateNote(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody NoteRequest request) {
        NoteResponse response = noteService.updateNote(getUserId(authentication), id, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            Authentication authentication,
            @PathVariable UUID id) {
        UUID userId = getUserId(authentication);
        NoteResponse note = noteService.getNoteById(userId, id);
        if (note.getFilePath() != null) {
            fileStorageService.deleteFile(note.getFilePath());
        }
        noteService.deleteNote(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Note deleted successfully", null));
    }

    @PatchMapping("/{id}/pin")
    public ResponseEntity<ApiResponse<NoteResponse>> togglePinNote(
            Authentication authentication,
            @PathVariable UUID id) {
        NoteResponse response = noteService.togglePinNote(getUserId(authentication), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<NoteResponse>> uploadPdf(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        
        UUID userId = getUserId(authentication);
        NoteResponse note = noteService.getNoteById(userId, id);
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equalsIgnoreCase("application/pdf")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only PDF files are allowed"));
        }
        
        try {
            if (note.getFilePath() != null) {
                fileStorageService.deleteFile(note.getFilePath());
            }
            
            String savedFilePath = fileStorageService.storeFile(file);
            NoteResponse updatedNote = noteService.updateNoteFilePath(userId, id, savedFilePath);
            
            return ResponseEntity.ok(ApiResponse.success("PDF uploaded successfully", updatedNote));
            
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Could not upload PDF: " + ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}/pdf")
    public ResponseEntity<ApiResponse<NoteResponse>> deletePdf(
            Authentication authentication,
            @PathVariable UUID id) {
        
        UUID userId = getUserId(authentication);
        NoteResponse note = noteService.getNoteById(userId, id);
        
        if (note.getFilePath() != null) {
            fileStorageService.deleteFile(note.getFilePath());
        }
        
        NoteResponse updatedNote = noteService.updateNoteFilePath(userId, id, null);
        return ResponseEntity.ok(ApiResponse.success("PDF deleted successfully", updatedNote));
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> servePdf(
            Authentication authentication,
            @PathVariable String fileName) {
        
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            Resource resource = fileStorageService.loadFileAsResource(fileName);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
