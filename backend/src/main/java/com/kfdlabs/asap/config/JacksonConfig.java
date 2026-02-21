package com.kfdlabs.asap.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.openapitools.jackson.nullable.JsonNullableModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Configuration
public class JacksonConfig {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    @Bean
    public Module jsonNullableModule() {
        return new JsonNullableModule();
    }

    @Bean
    public Module localDateTimeModule() {
        SimpleModule module = new SimpleModule();
        module.addSerializer(LocalDateTime.class, new JsonSerializer<>() {
            @Override
            public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                gen.writeString(value.format(FORMATTER));
            }
        });
        module.addDeserializer(LocalDateTime.class, new JsonDeserializer<>() {
            @Override
            public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
                String value = p.getValueAsString();
                if (value == null || value.isEmpty()) {
                    return null;
                }

                // Check if value has timezone info (Z or +/- offset)
                if (hasTimezoneInfo(value)) {
                    OffsetDateTime odt = OffsetDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
                    return odt.withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime();
                }

                // Check if it's date-only (no 'T' separator)
                if (!value.contains("T")) {
                    return LocalDateTime.parse(value + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                }

                // Plain LocalDateTime - assume already UTC
                return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            }

            private boolean hasTimezoneInfo(String value) {
                if (value.endsWith("Z")) {
                    return true;
                }
                // Check for offset like +05:00 or -08:00 at the end
                int len = value.length();
                if (len >= 6) {
                    char sign = value.charAt(len - 6);
                    if (sign == '+' || sign == '-') {
                        return value.charAt(len - 3) == ':';
                    }
                }
                return false;
            }
        });
        return module;
    }
}
