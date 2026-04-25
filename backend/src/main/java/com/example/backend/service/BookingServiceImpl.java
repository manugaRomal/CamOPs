package com.example.backend.service;

import com.example.backend.domain.Booking;
import com.example.backend.domain.Resource;
import com.example.backend.dto.AlternativeResourceSuggestionDTO;
import com.example.backend.dto.BookingConflictSuggestionDTO;
import com.example.backend.dto.BookingRequestDTO;
import com.example.backend.dto.BookingResponseDTO;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final String PENDING = "PENDING";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String CANCELLED = "CANCELLED";
    private static final int MAX_ALTERNATIVE_RESOURCES = 3;

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final NotificationService notificationService;

    public BookingServiceImpl(
            BookingRepository bookingRepository,
            ResourceRepository resourceRepository,
            NotificationService notificationService
    ) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.notificationService = notificationService;
    }

    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO bookingRequestDTO) {
        long conflictCount = bookingRepository.countConflictingBookings(
                bookingRequestDTO.getResourceId(),
                bookingRequestDTO.getBookingDate(),
                bookingRequestDTO.getStartTime(),
                bookingRequestDTO.getEndTime()
        );

        if (conflictCount > 0) {
            BookingConflictSuggestionDTO suggestion = buildConflictSuggestion(bookingRequestDTO);
            throw new ResourceConflictException(
                    "The selected resource is already booked for this time range. " +
                            "Please check the suggested time slot or alternative resources.",
                    suggestion
            );
        }

        Booking booking = new Booking();
        booking.setUserId(bookingRequestDTO.getUserId());
        booking.setResourceId(bookingRequestDTO.getResourceId());
        booking.setBookingDate(bookingRequestDTO.getBookingDate());
        booking.setStartTime(bookingRequestDTO.getStartTime());
        booking.setEndTime(bookingRequestDTO.getEndTime());
        booking.setPurpose(bookingRequestDTO.getPurpose());
        booking.setExpectedAttendees(bookingRequestDTO.getExpectedAttendees());
        booking.setStatus(PENDING);

        Booking savedBooking = bookingRepository.save(booking);
        return mapToResponseDTO(savedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
        return mapToResponseDTO(booking);
    }

    @Override
    public BookingResponseDTO updateBookingStatus(Long bookingId, String newStatus, Long reviewedBy, String reviewReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        String normalizedCurrentStatus = normalizeStatus(booking.getStatus());
        String normalizedNewStatus = normalizeStatus(newStatus);

        if (!isValidStatusTransition(normalizedCurrentStatus, normalizedNewStatus)) {
            throw new IllegalStateException(
                    String.format(
                            "Invalid status transition from %s to %s",
                            normalizedCurrentStatus,
                            normalizedNewStatus
                    )
            );
        }

        booking.setStatus(normalizedNewStatus);
        booking.setReviewedBy(reviewedBy);
        booking.setReviewReasons(reviewReason);

        if (APPROVED.equals(normalizedNewStatus)) {
            booking.setApprovedAt(LocalDateTime.now());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        if (APPROVED.equals(normalizedNewStatus) || REJECTED.equals(normalizedNewStatus)) {
            notificationService.notifyBookingDecision(
                    updatedBooking.getUserId(),
                    updatedBooking.getBookingId(),
                    normalizedNewStatus
            );
        }
        return mapToResponseDTO(updatedBooking);
    }

    @Override
    public BookingResponseDTO cancelBookingByStudent(Long bookingId, Long studentUserId, String cancelReason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getUserId().equals(studentUserId)) {
            throw new BadRequestException("Student can only cancel their own booking.");
        }

        return updateBookingStatus(bookingId, CANCELLED, studentUserId, cancelReason);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getUserBookings(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .toList();
    }

    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        if (PENDING.equals(currentStatus)) {
            return Set.of(APPROVED, REJECTED, CANCELLED).contains(newStatus);
        }

        if (APPROVED.equals(currentStatus)) {
            return CANCELLED.equals(newStatus);
        }

        return false;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            throw new IllegalStateException("Booking status must not be null or blank.");
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }

    private BookingConflictSuggestionDTO buildConflictSuggestion(BookingRequestDTO bookingRequestDTO) {
        BookingConflictSuggestionDTO suggestion = new BookingConflictSuggestionDTO();

        List<Booking> conflicts = bookingRepository.findConflictingBookings(
                bookingRequestDTO.getResourceId(),
                bookingRequestDTO.getBookingDate(),
                bookingRequestDTO.getStartTime(),
                bookingRequestDTO.getEndTime()
        );

        LocalDateTime suggestedStart = calculateNextAvailableStart(
                bookingRequestDTO.getStartTime(),
                bookingRequestDTO.getEndTime(),
                conflicts
        );
        Duration requestedDuration = Duration.between(bookingRequestDTO.getStartTime(), bookingRequestDTO.getEndTime());
        LocalDateTime suggestedEnd = suggestedStart.plus(requestedDuration);

        suggestion.setSuggestedStartTime(suggestedStart);
        suggestion.setSuggestedEndTime(suggestedEnd);
        try {
            suggestion.setAlternativeResources(findAlternativeResources(bookingRequestDTO));
        } catch (RuntimeException ex) {
            // If resource lookup fails due to schema differences, keep conflict handling available.
            suggestion.setAlternativeResources(List.of());
        }
        return suggestion;
    }

    private LocalDateTime calculateNextAvailableStart(LocalDateTime requestedStart, LocalDateTime requestedEnd, List<Booking> conflicts) {
        Duration requestedDuration = Duration.between(requestedStart, requestedEnd);
        LocalDateTime candidateStart = requestedStart;
        LocalDateTime candidateEnd = requestedEnd;

        for (Booking conflict : conflicts) {
            boolean overlaps = conflict.getStartTime().isBefore(candidateEnd) && conflict.getEndTime().isAfter(candidateStart);
            if (overlaps) {
                candidateStart = conflict.getEndTime();
                candidateEnd = candidateStart.plus(requestedDuration);
            }
        }
        return candidateStart;
    }

    private List<AlternativeResourceSuggestionDTO> findAlternativeResources(BookingRequestDTO bookingRequestDTO) {
        List<Resource> candidateResources = resourceRepository.findAlternativeResources(
                bookingRequestDTO.getResourceId(),
                bookingRequestDTO.getExpectedAttendees()
        );

        return candidateResources.stream()
                .filter(resource -> bookingRepository.countConflictingBookingsForResource(
                        resource.getResourceId(),
                        bookingRequestDTO.getBookingDate(),
                        bookingRequestDTO.getStartTime(),
                        bookingRequestDTO.getEndTime()
                ) == 0)
                .limit(MAX_ALTERNATIVE_RESOURCES)
                .map(this::mapToAlternativeResourceSuggestion)
                .toList();
    }

    private AlternativeResourceSuggestionDTO mapToAlternativeResourceSuggestion(Resource resource) {
        AlternativeResourceSuggestionDTO suggestion = new AlternativeResourceSuggestionDTO();
        suggestion.setResourceId(resource.getResourceId());
        suggestion.setResourceCode(resource.getResourceCode());
        suggestion.setResourceName(resource.getResourceName());
        suggestion.setCapacity(resource.getCapacity());
        suggestion.setLocation(resource.getLocation());
        return suggestion;
    }

    private BookingResponseDTO mapToResponseDTO(Booking booking) {
        BookingResponseDTO responseDTO = new BookingResponseDTO();
        responseDTO.setBookingId(booking.getBookingId());
        responseDTO.setUserId(booking.getUserId());
        responseDTO.setResourceId(booking.getResourceId());
        responseDTO.setBookingDate(booking.getBookingDate());
        responseDTO.setStartTime(booking.getStartTime());
        responseDTO.setEndTime(booking.getEndTime());
        responseDTO.setPurpose(booking.getPurpose());
        responseDTO.setExpectedAttendees(booking.getExpectedAttendees());
        responseDTO.setStatus(booking.getStatus());
        responseDTO.setApprovedAt(booking.getApprovedAt());
        responseDTO.setReviewedBy(booking.getReviewedBy());
        responseDTO.setReviewReasons(booking.getReviewReasons());
        responseDTO.setCreatedAt(booking.getCreatedAt());
        responseDTO.setUpdatedAt(booking.getUpdatedAt());
        return responseDTO;
    }
}
