package com.example.backend.service;

import com.example.backend.domain.Resource;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.ResourceRepository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class ResourceService {
    private static final Set<String> ALLOWED_RESOURCE_STATUSES = Set.of("ACTIVE", "INACTIVE", "MAINTENANCE", "OUT_OF_SERVICE");

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    public Resource createResource(Resource resource) {
        validateAvailabilityWindow(resource.getAvailabilityStartTime(), resource.getAvailabilityEndTime());
        resource.setStatus(normalizeStatus(resource.getStatus()));
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        return resourceRepository.findById(id)
                .map(resource -> {
                    validateAvailabilityWindow(updatedResource.getAvailabilityStartTime(), updatedResource.getAvailabilityEndTime());
                    resource.setResourceCode(updatedResource.getResourceCode());
                    resource.setResourceName(updatedResource.getResourceName());
                    resource.setResourceType(updatedResource.getResourceType());
                    resource.setDescription(updatedResource.getDescription());
                    resource.setStatus(normalizeStatus(updatedResource.getStatus()));
                    resource.setLocation(updatedResource.getLocation());
                    resource.setCapacity(updatedResource.getCapacity());
                    resource.setResourceImage(updatedResource.getResourceImage());
                    resource.setAvailabilityStartTime(updatedResource.getAvailabilityStartTime());
                    resource.setAvailabilityEndTime(updatedResource.getAvailabilityEndTime());
                    return resourceRepository.save(resource);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String resourceType, String location, Integer capacity, String status) {
        List<Specification<Resource>> specs = new ArrayList<>();

        if (resourceType != null && !resourceType.isBlank()) {
            specs.add((root, query, cb) -> cb.equal(cb.lower(root.get("resourceType")), resourceType.trim().toLowerCase()));
        }

        if (location != null && !location.isBlank()) {
            specs.add((root, query, cb) -> cb.equal(cb.lower(root.get("location")), location.trim().toLowerCase()));
        }

        if (capacity != null) {
            specs.add((root, query, cb) -> cb.equal(root.get("capacity"), capacity));
        }

        if (status != null && !status.isBlank()) {
            String normalizedStatus = normalizeStatus(status);
            specs.add((root, query, cb) -> cb.equal(cb.upper(root.get("status")), normalizedStatus));
        }

        if (specs.isEmpty()) {
            return resourceRepository.findAll();
        }

        Specification<Resource> mergedSpec = specs.stream()
                .reduce(Specification::and)
                .orElseThrow(() -> new IllegalStateException("Unable to combine search filters"));

        return resourceRepository.findAll(mergedSpec);
    }

    public Resource updateResourceStatus(Long id, String status) {
        String normalizedStatus = normalizeStatus(status);
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setStatus(normalizedStatus);
                    return resourceRepository.save(resource);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!ALLOWED_RESOURCE_STATUSES.contains(normalizedStatus)) {
            throw new BadRequestException("Invalid status. Allowed values: " + ALLOWED_RESOURCE_STATUSES);
        }

        return normalizedStatus;
    }

    private void validateAvailabilityWindow(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Availability start and end time are required");
        }

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Availability end time must be later than start time");
        }
    }
}