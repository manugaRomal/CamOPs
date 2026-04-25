package com.example.backend.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "Resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resource_id")
    private Long resourceId;

    @Column(name = "resource_code", nullable = false, unique = true)
    @NotBlank(message = "Resource code is required")
    @Size(max = 50, message = "Resource code must be at most 50 characters")
    private String resourceCode;

    @Column(name = "resource_name", nullable = false)
    @NotBlank(message = "Resource name is required")
    @Size(max = 100, message = "Resource name must be at most 100 characters")
    private String resourceName;

    @Column(name = "resource_type", nullable = false)
    @NotBlank(message = "Resource type is required")
    @Size(max = 50, message = "Resource type must be at most 50 characters")
    private String resourceType;

    @Column(name = "description")
    private String description;

    @Column(name = "status", nullable = false)
    @NotBlank(message = "Status is required")
    @Size(max = 30, message = "Status must be at most 30 characters")
    private String status;

    @Column(name = "location")
    @Size(max = 150, message = "Location must be at most 150 characters")
    private String location;

    @Column(name = "capacity")
    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Column(name = "resource_image")
    private String resourceImage;

    @Column(name = "availability_start_time")
    @NotNull(message = "Availability start time is required")
    private LocalTime availabilityStartTime;

    @Column(name = "availability_end_time")
    @NotNull(message = "Availability end time is required")
    private LocalTime availabilityEndTime;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    // Constructor
    public Resource() {}

    // Getters & Setters

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceCode() {
        return resourceCode;
    }

    public void setResourceCode(String resourceCode) {
        this.resourceCode = resourceCode;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getResourceImage() {
        return resourceImage;
    }

    public void setResourceImage(String resourceImage) {
        this.resourceImage = resourceImage;
    }

    public LocalTime getAvailabilityStartTime() {
        return availabilityStartTime;
    }

    public void setAvailabilityStartTime(LocalTime availabilityStartTime) {
        this.availabilityStartTime = availabilityStartTime;
    }

    public LocalTime getAvailabilityEndTime() {
        return availabilityEndTime;
    }

    public void setAvailabilityEndTime(LocalTime availabilityEndTime) {
        this.availabilityEndTime = availabilityEndTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}