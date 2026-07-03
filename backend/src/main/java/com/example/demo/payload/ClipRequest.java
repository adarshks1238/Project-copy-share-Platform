package com.example.demo.payload;

import lombok.Data;

@Data
public class ClipRequest {
    private String type; // "LINK" or "TEXT"
    private String content;
    private String title;
    private String deviceInfo;
}
