
package com.kfdlabs.asap.util;

import lombok.experimental.UtilityClass;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Objects;

import static java.util.Arrays.stream;
import static java.util.Objects.isNull;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.springframework.data.domain.PageRequest.of;
import static org.springframework.data.domain.Sort.Direction.ASC;
import static org.springframework.data.domain.Sort.Direction.DESC;

@UtilityClass
public class PaginationUtils {

    private static final int DEFAULT_PAGEABLE_LIMIT = 5000;

    public static Pageable getPageable(Integer page, Integer limit) {
        if (isNull(page) && isNull(limit)) {
            return Pageable.unpaged();
        }
        return getPlainPageable(page, limit, null);
    }

    public static Pageable getPageable(Integer page, Integer limit, String order, String... sort) {
        if (isNull(page) && isNull(limit) && isNull(order)) {
            return Pageable.unpaged();
        }
        return getPlainPageable(page, limit, order, sort);
    }

    private static Pageable getPlainPageable(Integer page, Integer limit, String order, String... sort) {
        page = page == null || page < 0 ? 0 : page;
        limit = limit == null || limit < 1 ? DEFAULT_PAGEABLE_LIMIT : limit;
        sort = stream(sort)
                .filter(Objects::nonNull)
                .toArray(String[]::new);
        if (sort.length == 0) {
            return of(page, limit);
        }
        Sort.Direction direction = isNotBlank(order) && DESC.name().equalsIgnoreCase(order) ? DESC : ASC;
        return of(page, limit, direction, sort);
    }
}
