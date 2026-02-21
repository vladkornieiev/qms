package com.kfdlabs.asap.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

@Configuration
public class AwsConfig {

    @Value("${aws.access-key}")
    private String accessKey;
    @Value("${aws.secret-key}")
    private String secretKey;
    @Value("${aws.region}")
    private String region;
    @Value("${aws.endpoint:}")
    private String endpoint;
    @Value("${aws.s3.presigned-url-endpoint:}")
    private String presignedUrlEndpoint;

    @Bean
    public S3Client s3Client() {
        S3ClientBuilder builder = S3Client.builder();
        if (endpoint != null && !endpoint.isEmpty()) {
            builder = builder.endpointOverride(URI.create(endpoint));
        }
        return builder
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                // Configure for Cloudflare R2 compatibility
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)  // R2 requires path-style access
                        .checksumValidationEnabled(false)  // Disable checksum validation for R2
                        .build())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        S3Presigner.Builder builder = S3Presigner.builder();
        // Use public endpoint for presigned URLs if configured, otherwise use internal endpoint
        String endpointToUse = (presignedUrlEndpoint != null && !presignedUrlEndpoint.isEmpty())
                ? presignedUrlEndpoint
                : endpoint;
        if (endpointToUse != null && !endpointToUse.isEmpty()) {
            builder = builder.endpointOverride(URI.create(endpointToUse));
        }
        return builder
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)))
                // Configure for Cloudflare R2 compatibility
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(true)  // R2 requires path-style access
                        .checksumValidationEnabled(false)  // Disable checksum validation for R2
                        .build())
                .build();
    }
}
