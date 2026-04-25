package com.example.backend.repository;

import com.example.backend.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Ticket> findByAssignedToUserIdOrderByCreatedAtDesc(Long assignedToUserId);

    @Query("select t from Ticket t order by t.createdAt desc")
    List<Ticket> findAllOrderByCreatedAtDesc();

    @Query("select t from Ticket t where t.userId = :uid or t.assignedToUserId = :uid order by t.createdAt desc")
    List<Ticket> findForTechnicianUser(@Param("uid") Long userId);

    @Query(
            "select count(t) from Ticket t where t.resourceId = :resourceId "
                    + "and upper(t.status) in ('OPEN', 'IN_PROGRESS')"
    )
    long countOpenOrInProgressByResourceId(@Param("resourceId") Long resourceId);

    @Query(
            "select count(t) from Ticket t where t.resourceId = :resourceId "
                    + "and upper(t.status) in ('OPEN', 'IN_PROGRESS') "
                    + "and upper(t.priority) in ('HIGH', 'CRITICAL')"
    )
    long countUrgentOpenByResourceId(@Param("resourceId") Long resourceId);

    @Query("select count(t) from Ticket t where t.resourceId = :resourceId")
    long countByResourceId(@Param("resourceId") Long resourceId);
}
