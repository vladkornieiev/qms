package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.OneTimePassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OneTimePasswordRepository extends JpaRepository<OneTimePassword, UUID> {

    Optional<OneTimePassword> findByCode(String code);

    @Query("SELECT otp FROM OneTimePassword otp WHERE lower(otp.email) = lower(:email)")
    Optional<OneTimePassword> findByEmail(String email);

    @Modifying
    @Query("DELETE FROM OneTimePassword otp WHERE otp.expiresAt < :now")
    void deleteExpiredCodes(@Param("now") LocalDateTime now);
}
