package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.LoginLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface LoginLinkRepository extends JpaRepository<LoginLink, Long> {
    Optional<LoginLink> findByToken(String token);

    @Modifying
    @Query("DELETE FROM LoginLink l WHERE l.email = :email")
    void deleteByEmail(String email);

    @Modifying
    @Query("DELETE FROM LoginLink l WHERE l.expiresAt < :now")
    int deleteExpired(LocalDateTime now);
} 