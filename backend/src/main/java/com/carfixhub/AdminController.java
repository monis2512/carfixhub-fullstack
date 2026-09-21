package com.carfixhub;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private static final String AUTH_KEY = "CARFIXHUB_ADMIN_AUTH";

    private final CarQueryRepository repo;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AdminController(CarQueryRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/session")
    public ResponseEntity<?> session(HttpSession session) {
        return ResponseEntity.ok(Map.of("authenticated", isAuthenticated(session)));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        if (request == null || !adminUsername.equals(request.username()) || !adminPassword.equals(request.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid username or password."));
        }
        session.setAttribute(AUTH_KEY, true);
        return ResponseEntity.ok(Map.of("success", true, "message", "Login successful."));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/queries")
    public ResponseEntity<?> queries(HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        return ResponseEntity.ok(repo.findAllByOrderByCreatedAtDesc());
    }

    @DeleteMapping("/queries/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        if (!isAuthenticated(session)) return unauthorized();
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Enquiry not found."));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Enquiry deleted."));
    }

    private boolean isAuthenticated(HttpSession session) {
        return Boolean.TRUE.equals(session.getAttribute(AUTH_KEY));
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Admin login required."));
    }

    public record LoginRequest(String username, String password) {}
}
