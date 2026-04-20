package com.example.backend.service;

import com.example.backend.domain.Resource;
import com.example.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

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
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        return resourceRepository.findById(id)
                .map(resource -> {
                    resource.setResourceCode(updatedResource.getResourceCode());
                    resource.setResourceName(updatedResource.getResourceName());
                    resource.setResourceType(updatedResource.getResourceType());
                    resource.setDescription(updatedResource.getDescription());
                    resource.setStatus(updatedResource.getStatus());
                    resource.setLocation(updatedResource.getLocation());
                    resource.setCapacity(updatedResource.getCapacity());
                    resource.setResourceImage(updatedResource.getResourceImage());
                    resource.setAvailabilityStartTime(updatedResource.getAvailabilityStartTime());
                    resource.setAvailabilityEndTime(updatedResource.getAvailabilityEndTime());
                    return resourceRepository.save(resource);
                })
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchResources(String resourceType, String location, Integer capacity, String status) {
        if (resourceType != null && !resourceType.isBlank()) {
            return resourceRepository.findByResourceTypeIgnoreCase(resourceType);
        }

        if (location != null && !location.isBlank()) {
            return resourceRepository.findByLocationIgnoreCase(location);
        }

        if (capacity != null) {
            return resourceRepository.findByCapacity(capacity);
        }

        if (status != null && !status.isBlank()) {
            return resourceRepository.findByStatusIgnoreCase(status);
        }

        return resourceRepository.findAll();
    }
}