package com.example.demo.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "clips")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Clip {
    @Id
    private String id;

    @Indexed
    private String userId;

    private String type; // "LINK" or "TEXT"

    private String content;

    private String title;

    private String deviceInfo;

    @Builder.Default
    private int copyCount = 0;

    private Instant createdAt;
}
