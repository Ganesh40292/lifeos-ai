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
 * Production-grade Cloud File Storage Service.
 * Enforces persistent Supabase Cloud Storage in production environments
 * and forbids silent local disk fallbacks when running in production mode.
 */
@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final String supabaseUrl;
    private final String supabaseKey;
    private final String bucketName;
    private final String activeProfile;
    private final RestTemplate restTemplate;

    public FileStorageService(
            @Value("${supabase.url:}") String supabaseUrl,
            @Value("${supabase.key:}") String supabaseKey,
            @Value("${supabase.bucket:notes}") String bucketName,
            @Value("${spring.profiles.active:local}") String activeProfile) {
        this.supabaseUrl = supabaseUrl != null ? supabaseUrl.trim().replaceAll("/+$", "") : "";
        this.supabaseKey = supabaseKey != null ? supabaseKey.trim() : "";
        this.bucketName = bucketName != null && !bucketName.isEmpty() ? bucketName : "notes";
        this.activeProfile = activeProfile != null ? activeProfile.trim().toLowerCase() : "local";
        this.restTemplate = new RestTemplate();
    }

    public boolean isSupabaseStorageEnabled() {
        return !supabaseUrl.isEmpty() && !supabaseKey.isEmpty();
    }

    public boolean isProductionEnvironment() {
        return activeProfile.contains("supabase") || activeProfile.contains("prod");
    }

    /**
     * Store file persistently in Supabase Storage or local filesystem (local dev only).
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
                log.error("Failed to upload file to Supabase Storage: {}", e.getMessage(), e);
                if (isProductionEnvironment()) {
                    throw new IOException("Production Storage Error: Upload to Supabase Cloud Storage failed: " + e.getMessage(), e);
                }
            }
        }

        // Enforce cloud storage in production
        if (isProductionEnvironment()) {
            throw new IOException("Production Configuration Error: Supabase Storage parameters (SUPABASE_URL / SUPABASE_KEY) are missing or misconfigured. Local disk fallback is disabled in production.");
        }

        // Local Filesystem Fallback (Development profile only)
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

        // Local Filesystem Delete (Dev mode)
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
                log.warn("Could not load file from Supabase Storage: {}", e.getMessage());
            }
        }

        if (isProductionEnvironment() && !fileName.startsWith("uploads/")) {
            throw new IOException("Production Storage Error: File not found in Supabase Cloud Storage: " + fileName);
        }

        // Local Filesystem Load (Dev mode)
        String cleanLocalName = fileName.startsWith("supabase:") ? fileName.substring(9) : fileName;
        Path filePath = Paths.get("uploads/notes/").resolve(cleanLocalName).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        }

        throw new IOException("File not found or unreadable: " + fileName);
    }
}
