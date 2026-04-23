package com.example.backend.repository;

import com.example.backend.domain.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

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
