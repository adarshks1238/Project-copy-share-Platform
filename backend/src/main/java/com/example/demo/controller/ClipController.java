package com.example.demo.controller;

import com.example.demo.model.Clip;
import com.example.demo.model.User;
import com.example.demo.payload.ClipRequest;
import com.example.demo.repository.ClipRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/clips")
public class ClipController {

    @Autowired
    private ClipRepository clipRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getUserClips(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Clip> clips = clipRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(clips);
    }

    @PostMapping
    public ResponseEntity<?> createClip(@RequestBody ClipRequest clipRequest, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Clip clip = Clip.builder()
                .userId(user.getId())
                .type(clipRequest.getType())
                .content(clipRequest.getContent())
                .title(clipRequest.getTitle())
                .deviceInfo(clipRequest.getDeviceInfo())
                .createdAt(Instant.now())
                .build();

        Clip savedClip = clipRepository.save(clip);
        return ResponseEntity.ok(savedClip);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClip(@PathVariable String id, Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Clip clip = clipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clip not found"));

        if (!clip.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You do not have permission to delete this clip");
        }

        clipRepository.delete(clip);
        return ResponseEntity.ok("Clip deleted successfully");
    }
}
