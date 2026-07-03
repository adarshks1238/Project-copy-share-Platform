package com.example.demo.repository;

import com.example.demo.model.Clip;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClipRepository extends MongoRepository<Clip, String> {
    List<Clip> findByUserIdOrderByCreatedAtDesc(String userId);
}
