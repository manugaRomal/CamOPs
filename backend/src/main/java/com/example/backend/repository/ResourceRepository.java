package com.example.backend.repository;

import com.example.backend.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByResourceTypeIgnoreCase(String resourceType);

    List<Resource> findByLocationIgnoreCase(String location);

    List<Resource> findByCapacity(Integer capacity);

    List<Resource> findByStatusIgnoreCase(String status);
}