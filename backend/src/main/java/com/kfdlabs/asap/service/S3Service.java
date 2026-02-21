package com.kfdlabs.asap.service;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.InputStream;
import java.net.URI;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${aws.s3.bucket}")
    private String bucketName;
    @Value("${aws.s3.presigned-url-expiration-minutes}")
    private int presignedUrlExpirationMinutes;

    @SneakyThrows
    public URI getPresignedUrl(String path) {
        return getPresignedUrl(path, Duration.ofMinutes(presignedUrlExpirationMinutes));
    }

    // todo encryption/decryption logic
    @SneakyThrows
    public URI getPresignedUrl(String path, Duration duration) {
        GetObjectRequest objectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(path)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(duration)
                .getObjectRequest(objectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

        return presignedRequest.url().toURI();
    }

    @SneakyThrows
    public void saveFileToS3(byte[] content, String path) {
        s3Client.putObject(
                builder -> builder.key(path).bucket(bucketName),
                RequestBody.fromBytes(content)
        );
    }

    public void deleteFileFromS3(String path) {
        s3Client.deleteObject(builder -> builder.key(path).bucket(bucketName));
    }

    public InputStream downloadFileFromS3(String path) {
        return s3Client.getObject(builder -> builder.key(path).bucket(bucketName));
    }
}
