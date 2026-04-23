package com.example.backend.repository;

import com.example.backend.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    List<Resource> findByResourceTypeIgnoreCase(String resourceType);

    List<Resource> findByLocationIgnoreCase(String location);

    List<Resource> findByCapacity(Integer capacity);

    List<Resource> findByStatusIgnoreCase(String status);
}