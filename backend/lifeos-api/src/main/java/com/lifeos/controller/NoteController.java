package com.lifeos.controller;

import com.lifeos.dto.request.NoteRequest;
import com.lifeos.dto.response.ApiResponse;
import com.lifeos.dto.response.NoteResponse;
import com.lifeos.dto.response.UserResponse;
import com.lifeos.service.NoteService;
import com.lifeos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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
        noteService.deleteNote(getUserId(authentication), id);
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
            Path uploadPath = Paths.get("uploads/notes/").toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String originalFileName = file.getOriginalFilename();
            String fileExtension = ".pdf";
            String cleanName = originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_") : "document";
            if (!cleanName.endsWith(fileExtension)) {
                cleanName += fileExtension;
            }
            String uniqueFileName = UUID.randomUUID().toString() + "_" + cleanName;
            Path targetLocation = uploadPath.resolve(uniqueFileName);
            
            if (note.getFilePath() != null) {
                Path oldPath = Paths.get(note.getFilePath()).toAbsolutePath().normalize();
                Files.deleteIfExists(oldPath);
            }
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            String savedRelativePath = "uploads/notes/" + uniqueFileName;
            NoteResponse updatedNote = noteService.updateNoteFilePath(userId, id, savedRelativePath);
            
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
            try {
                Path filePath = Paths.get(note.getFilePath()).toAbsolutePath().normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException ex) {
                System.err.println("Could not delete physical PDF file: " + ex.getMessage());
            }
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
            Path filePath = Paths.get("uploads/notes/").resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
