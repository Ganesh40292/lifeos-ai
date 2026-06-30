package com.lifeos.service;

import com.lifeos.dto.request.ContactRequest;
import com.lifeos.dto.response.ContactResponse;
import com.lifeos.entity.Contact;
import com.lifeos.entity.User;
import com.lifeos.repository.ContactRepository;
import com.lifeos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;

    public List<ContactResponse> getContacts(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return contactRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ContactResponse createContact(String userEmail, ContactRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Contact contact = Contact.builder()
                .user(user)
                .name(request.getName())
                .company(request.getCompany())
                .position(request.getPosition())
                .email(request.getEmail())
                .phone(request.getPhone())
                .notes(request.getNotes())
                .build();

        Contact saved = contactRepository.save(contact);
        return mapToResponse(saved);
    }

    public ContactResponse updateContact(UUID id, ContactRequest request, String userEmail) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        contact.setName(request.getName());
        contact.setCompany(request.getCompany());
        contact.setPosition(request.getPosition());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setNotes(request.getNotes());

        Contact updated = contactRepository.save(contact);
        return mapToResponse(updated);
    }

    public void deleteContact(UUID id, String userEmail) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        if (!contact.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }

        contactRepository.delete(contact);
    }

    private ContactResponse mapToResponse(Contact contact) {
        return ContactResponse.builder()
                .id(contact.getId())
                .name(contact.getName())
                .company(contact.getCompany())
                .position(contact.getPosition())
                .email(contact.getEmail())
                .phone(contact.getPhone())
                .notes(contact.getNotes())
                .createdAt(contact.getCreatedAt())
                .updatedAt(contact.getUpdatedAt())
                .build();
    }
}
