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
                    resource.setName(updatedResource.getName());
                    resource.setType(updatedResource.getType());
                    resource.setLocation(updatedResource.getLocation());
                    resource.setCapacity(updatedResource.getCapacity());
                    resource.setStatus(updatedResource.getStatus());
                    resource.setAvailabilityWindow(updatedResource.getAvailabilityWindow());
                    return resourceRepository.save(resource);
                })
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}