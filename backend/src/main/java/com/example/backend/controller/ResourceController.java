package com.example.backend.controller;

import com.example.backend.controller.dto.ResourceHealthResponse;
import com.example.backend.controller.dto.ResourceStatusUpdateRequest;
import com.example.backend.domain.Resource;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.service.ResourceHealthService;
import com.example.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    private final ResourceService resourceService;
    private final ResourceHealthService resourceHealthService;

    public ResourceController(ResourceService resourceService, ResourceHealthService resourceHealthService) {
        this.resourceService = resourceService;
        this.resourceHealthService = resourceHealthService;
    }

    @GetMapping
    public List<Resource> getResources(
        @RequestParam(required = false) String resourceType,
        @RequestParam(required = false) String location,
        @RequestParam(required = false) Integer capacity,
        @RequestParam(required = false) String status
    ) {
        return resourceService.searchResources(resourceType, location, capacity, status);
    }

    @GetMapping("/{id}")
    public Resource getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    @GetMapping("/{id}/health")
    public ResourceHealthResponse getResourceHealth(@PathVariable Long id) {
        return resourceHealthService.computeHealth(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Resource createResource(@Valid @RequestBody Resource resource) {
        return resourceService.createResource(resource);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateResource(@PathVariable Long id, @Valid @RequestBody Resource resource) {
        return resourceService.updateResource(id, resource);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Resource updateResourceStatus(@PathVariable Long id, @Valid @RequestBody ResourceStatusUpdateRequest request) {
        return resourceService.updateResourceStatus(id, request.getStatus());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}