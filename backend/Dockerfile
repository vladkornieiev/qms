# Multi-stage build for minimal image size
# Stage 1: Build stage with full JDK
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy gradle wrapper and build files
COPY backend/gradlew .
COPY backend/gradle gradle/
COPY backend/build.gradle backend/settings.gradle ./
COPY openapi.yml ../openapi.yml

# Copy source code
COPY backend/src src/

# Make gradlew executable and build
RUN chmod +x ./gradlew && ./gradlew assemble --no-daemon

# Stage 2: Minimal runtime with distroless (smallest possible)
FROM gcr.io/distroless/java21-debian12:nonroot

WORKDIR /app

# Copy only the built JAR from builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

# Use optimized JVM flags for containers
ENTRYPOINT ["java", \
           "-server", \
           "-XX:+UseG1GC", \
           "-XX:MaxGCPauseMillis=100", \
           "-XX:+UseContainerSupport", \
           "-XX:InitialRAMPercentage=50", \
           "-XX:MaxRAMPercentage=80", \
           "-Djava.security.egd=file:/dev/./urandom", \
           "-jar", "app.jar"]