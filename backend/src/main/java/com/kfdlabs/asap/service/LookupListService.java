package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.LookupList;
import com.kfdlabs.asap.entity.LookupListItem;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.repository.LookupListItemRepository;
import com.kfdlabs.asap.repository.LookupListRepository;
import com.kfdlabs.asap.repository.OrganizationRepository;
import com.kfdlabs.asap.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class LookupListService {

    private final LookupListRepository lookupListRepository;
    private final LookupListItemRepository lookupListItemRepository;
    private final OrganizationRepository organizationRepository;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public List<LookupList> listLookupLists() {
        return lookupListRepository.findByOrganizationId(SecurityUtils.getCurrentOrganizationId());
    }

    public LookupList getLookupList(UUID id) {
        LookupList list = lookupListRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Lookup list not found"));
        if (!list.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return list;
    }

    public List<LookupListItem> getListItems(UUID listId) {
        return lookupListItemRepository.findByLookupListIdOrderByDisplayOrder(listId);
    }

    public LookupList createLookupList(CreateLookupListRequest request) {
        LookupList list = new LookupList();
        list.setOrganization(getCurrentOrg());
        list.setName(request.getName());
        list.setSlug(request.getSlug());
        list.setDescription(request.getDescription());
        return lookupListRepository.save(list);
    }

    public LookupList updateLookupList(UUID id, UpdateLookupListRequest request) {
        LookupList list = getLookupList(id);
        if (request.getName() != null) list.setName(request.getName().orElse(list.getName()));
        if (request.getDescription() != null) list.setDescription(request.getDescription().orElse(list.getDescription()));
        if (request.getIsActive() != null) list.setIsActive(request.getIsActive().orElse(list.getIsActive()));
        return lookupListRepository.save(list);
    }

    public void deleteLookupList(UUID id) {
        LookupList list = getLookupList(id);
        if (list.getIsSystem()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Cannot delete system lookup list");
        }
        lookupListRepository.delete(list);
    }

    public LookupListItem createItem(UUID listId, CreateLookupListItemRequest request) {
        LookupList list = getLookupList(listId);
        LookupListItem item = new LookupListItem();
        item.setLookupList(list);
        item.setValue(request.getValue());
        item.setLabel(request.getLabel());
        item.setColor(request.getColor());
        item.setIcon(request.getIcon());
        if (request.getMetadata() != null) {
            item.setMetadata(request.getMetadata());
        }
        if (request.getParentId() != null) {
            item.setParent(lookupListItemRepository.findById(request.getParentId()).orElse(null));
        }
        if (request.getDisplayOrder() != null) {
            item.setDisplayOrder(request.getDisplayOrder());
        }
        return lookupListItemRepository.save(item);
    }

    public LookupListItem updateItem(UUID listId, UUID itemId, UpdateLookupListItemRequest request) {
        getLookupList(listId); // verify access
        LookupListItem item = lookupListItemRepository.findById(itemId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Item not found"));
        if (request.getLabel() != null) item.setLabel(request.getLabel().orElse(item.getLabel()));
        if (request.getColor() != null) item.setColor(request.getColor().orElse(item.getColor()));
        if (request.getIcon() != null) item.setIcon(request.getIcon().orElse(item.getIcon()));
        if (request.getIsActive() != null) item.setIsActive(request.getIsActive().orElse(item.getIsActive()));
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder().orElse(item.getDisplayOrder()));
        return lookupListItemRepository.save(item);
    }

    public void deleteItem(UUID listId, UUID itemId) {
        getLookupList(listId); // verify access
        lookupListItemRepository.deleteById(itemId);
    }
}
