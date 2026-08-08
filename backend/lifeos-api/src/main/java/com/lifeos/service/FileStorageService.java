package com.lifeos.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Enterprise File Storage Service offering persistent Supabase Storage bucket uploads
 * with automatic local filesystem fallback for development environments.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucketName;
    private final RestTemplate restTemplate;

    public FileStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.key:}") String supabaseKey,
            @Value("${supabase.bucket:notes}") String bucketName) {
        this.supabaseUrl = supabaseUrl != null ? supabaseUrl.trim().replaceAll("/+$", "") : "";
        this.supabaseKey = supabaseKey != null ? supabaseKey.trim() : "";
        this.bucketName = bucketName != null && !bucketName.isEmpty() ? bucketName : "notes";
        this.restTemplate = new RestTemplate();
    }

    public boolean isSupabaseStorageEnabled() {
        return !supabaseUrl.isEmpty() && !supabaseKey.isEmpty();
    }

    /**
     * Store file persistently in Supabase Storage or local filesystem.
     * @return Path string or Supabase object reference
     */
    public String storeFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String cleanName = originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9.-]", "_") : "document.pdf";
        if (!cleanName.toLowerCase().endsWith(".pdf")) {
            cleanName += ".pdf";
        }
        String uniqueFileName = UUID.randomUUID().toString() + "_" + cleanName;

        if (isSupabaseStorageEnabled()) {
            try {
                String uploadUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, uniqueFileName);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setBearerAuth(supabaseKey);
                headers.set("apikey", supabaseKey);
                headers.set("x-upsert", "true");

                HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
                ResponseEntity<String> response = restTemplate.exchange(uploadUrl, HttpMethod.POST, requestEntity, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    log.info("Successfully uploaded file {} to Supabase Storage bucket {}", uniqueFileName, bucketName);
                    return "supabase:" + uniqueFileName;
                }
            } catch (Exception e) {
                log.error("Failed to upload to Supabase Storage, falling back to local storage: {}", e.getMessage());
            }
        }

        // Local Filesystem Fallback
        Path uploadPath = Paths.get("uploads/notes/").toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path targetLocation = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return "uploads/notes/" + uniqueFileName;
    }

    /**
     * Delete file from Supabase Storage or local filesystem.
     */
    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isEmpty()) return;

        if (filePath.startsWith("supabase:")) {
            String fileName = filePath.substring(9);
            if (isSupabaseStorageEnabled()) {
                try {
                    String deleteUrl = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, fileName);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setBearerAuth(supabaseKey);
                    headers.set("apikey", supabaseKey);

                    HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                    restTemplate.exchange(deleteUrl, HttpMethod.DELETE, requestEntity, String.class);
                    log.info("Deleted file {} from Supabase Storage", fileName);
                    return;
                } catch (Exception e) {
                    log.warn("Could not delete file from Supabase Storage: {}", e.getMessage());
                }
            }
        }

        // Local Filesystem Delete
        try {
            Path path = Paths.get(filePath.startsWith("uploads/") ? filePath : "uploads/notes/" + filePath).toAbsolutePath().normalize();
            Files.deleteIfExists(path);
        } catch (IOException e) {
            log.warn("Could not delete local file {}: {}", filePath, e.getMessage());
        }
    }

    /**
     * Load file resource for streaming or download.
     */
    public Resource loadFileAsResource(String fileName) throws IOException {
        if (fileName.startsWith("supabase:") || (fileName.contains("_") && isSupabaseStorageEnabled())) {
            String cleanFileName = fileName.startsWith("supabase:") ? fileName.substring(9) : fileName;
            try {
                String fetchUrl = String.format("%s/storage/v1/object/authenticated/%s/%s", supabaseUrl, bucketName, cleanFileName);
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(supabaseKey);
                headers.set("apikey", supabaseKey);

                HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                ResponseEntity<byte[]> response = restTemplate.exchange(fetchUrl, HttpMethod.GET, requestEntity, byte[].class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return new ByteArrayResource(response.getBody()) {
                        @Override
                        public String getFilename() {
                            return cleanFileName;
                        }
                    };
                }
            } catch (Exception e) {
                log.warn("Could not load file from Supabase Storage, trying local filesystem: {}", e.getMessage());
            }
        }

        // Local Filesystem Load
        String cleanLocalName = fileName.startsWith("supabase:") ? fileName.substring(9) : fileName;
        Path filePath = Paths.get("uploads/notes/").resolve(cleanLocalName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        }

        throw new IOException("File not found or unreadable: " + fileName);
    }
}
