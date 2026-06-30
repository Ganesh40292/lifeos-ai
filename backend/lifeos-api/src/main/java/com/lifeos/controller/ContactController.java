package com.lifeos.controller;

import com.lifeos.dto.request.ContactRequest;
import com.lifeos.dto.response.ContactResponse;
import com.lifeos.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<List<ContactResponse>> getContacts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(contactService.getContacts(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<ContactResponse> createContact(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ContactRequest request) {
        return new ResponseEntity<>(contactService.createContact(userDetails.getUsername(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactResponse> updateContact(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ContactRequest request) {
        return ResponseEntity.ok(contactService.updateContact(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContact(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        contactService.deleteContact(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
