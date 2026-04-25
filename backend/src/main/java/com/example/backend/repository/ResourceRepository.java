package com.example.backend.repository;

import com.example.backend.domain.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long>, JpaSpecificationExecutor<Resource> {

    List<Resource> findByResourceTypeIgnoreCase(String resourceType);

    List<Resource> findByLocationIgnoreCase(String location);

    List<Resource> findByCapacity(Integer capacity);

    List<Resource> findByStatusIgnoreCase(String status);

    @Query("""
            SELECT r
            FROM Resource r
            WHERE r.resourceId <> :excludedResourceId
              AND (:requiredCapacity IS NULL OR r.capacity >= :requiredCapacity)
            ORDER BY r.capacity ASC, r.resourceName ASC
            """)
    List<Resource> findAlternativeResources(
            @Param("excludedResourceId") Long excludedResourceId,
            @Param("requiredCapacity") Integer requiredCapacity
    );
}