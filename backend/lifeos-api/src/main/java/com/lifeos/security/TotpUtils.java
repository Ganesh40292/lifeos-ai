package com.lifeos.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

public class TotpUtils {

    private static final String ALGORITHM = "HmacSHA1";
    private static final int CODE_DIGITS = 6;
    private static final int TIME_STEP_SECONDS = 30;

    // Base32 Alphabet
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int[] BASE32_LOOKUP = new int[256];

    static {
        for (int i = 0; i < BASE32_LOOKUP.length; i++) {
            BASE32_LOOKUP[i] = -1;
        }
        for (int i = 0; i < BASE32_CHARS.length(); i++) {
            BASE32_LOOKUP[BASE32_CHARS.charAt(i)] = i;
        }
    }

    /**
     * Generate a new 16-character (80-bit) Base32 secret key.
     */
    public static String generateSecretKey() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(16);
        for (int i = 0; i < 16; i++) {
            sb.append(BASE32_CHARS.charAt(random.nextInt(BASE32_CHARS.length())));
        }
        return sb.toString();
    }

    /**
     * Generate the standard otpauth URI.
     */
    public static String getOtpauthUri(String email, String secret) {
        return String.format("otpauth://totp/LifeOS:%s?secret=%s&issuer=LifeOS", email, secret);
    }

    /**
     * Verify a 6-digit code with a tolerance window of 1 step before/after.
     */
    public static boolean verifyCode(String secret, int code) {
        if (secret == null || secret.length() != 16) {
            return false;
        }
        long currentWindow = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        for (int i = -1; i <= 1; i++) {
            if (getCodeForWindow(secret, currentWindow + i) == code) {
                return true;
            }
        }
        return false;
    }

    private static long getCodeForWindow(String secret, long window) {
        byte[] key = decodeBase32(secret);
        byte[] data = new byte[8];
        long value = window;
        for (int i = 8; i-- > 0; value >>>= 8) {
            data[i] = (byte) value;
        }

        try {
            SecretKeySpec signKey = new SecretKeySpec(key, ALGORITHM);
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(signKey);
            byte[] hash = mac.doFinal(data);

            int offset = hash[hash.length - 1] & 0xF;
            long truncatedHash = 0;
            for (int i = 0; i < 4; ++i) {
                truncatedHash <<= 8;
                truncatedHash |= (hash[offset + i] & 0xFF);
            }
            truncatedHash &= 0x7FFFFFFF;
            truncatedHash %= 1000000;
            return truncatedHash;
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error generating TOTP code", e);
        }
    }

    private static byte[] decodeBase32(String base32) {
        base32 = base32.toUpperCase();
        int len = (base32.length() * 5) / 8;
        byte[] bytes = new byte[len];
        int buffer = 0;
        int bitsLeft = 0;
        int count = 0;

        for (int i = 0; i < base32.length(); i++) {
            char ch = base32.charAt(i);
            int val = BASE32_LOOKUP[ch];
            if (val == -1) {
                continue; // Ignore padding or invalid characters
            }
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                bytes[count++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }
        return bytes;
    }
}
