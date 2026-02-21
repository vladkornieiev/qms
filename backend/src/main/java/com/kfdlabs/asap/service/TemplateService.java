package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Template;
import com.kfdlabs.asap.entity.TemplateItem;
import com.kfdlabs.asap.mapper.TemplateMapper;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TemplateService {

    private final TemplateRepository templateRepository;
    private final TemplateItemRepository templateItemRepository;
    private final OrganizationRepository organizationRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TemplateMapper templateMapper;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    public Page<Template> list(String query, String templateType, Integer page, Integer size) {
        return templateRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, templateType, PaginationUtils.getPageable(page, size));
    }

    public Template get(UUID id) {
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Template not found"));
        if (!template.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return template;
    }

    public TemplateDetailResponse getDetail(UUID id) {
        Template template = get(id);
        List<TemplateItem> items = templateItemRepository.findByTemplateIdOrderByDisplayOrderAsc(id);
        return templateMapper.toDetailDTO(template, items);
    }

    public Template create(CreateTemplateRequest request) {
        Organization org = getCurrentOrg();
        Template template = new Template();
        template.setOrganization(org);
        template.setName(request.getName());
        template.setTemplateType(request.getTemplateType());
        if (request.getDescription() != null) template.setDescription(request.getDescription());
        if (request.getIsClientFacing() != null) template.setIsClientFacing(request.getIsClientFacing());
        if (request.getIsActive() != null) template.setIsActive(request.getIsActive());
        if (request.getSettings() != null) template.setSettings(request.getSettings());
        template.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return templateRepository.save(template);
    }

    public Template update(UUID id, UpdateTemplateRequest request) {
        Template template = get(id);
        if (request.getName() != null) template.setName(request.getName().orElse(template.getName()));
        if (request.getDescription() != null) template.setDescription(request.getDescription().orElse(template.getDescription()));
        if (request.getTemplateType() != null) template.setTemplateType(request.getTemplateType().orElse(template.getTemplateType()));
        if (request.getIsClientFacing() != null) template.setIsClientFacing(request.getIsClientFacing().orElse(template.getIsClientFacing()));
        if (request.getIsActive() != null) template.setIsActive(request.getIsActive().orElse(template.getIsActive()));
        if (request.getSettings() != null) template.setSettings(request.getSettings().orElse(template.getSettings()));
        return templateRepository.save(template);
    }

    public void delete(UUID id) {
        Template template = get(id);
        templateRepository.delete(template);
    }

    public Template clone(UUID id) {
        Template original = get(id);
        Organization org = getCurrentOrg();

        Template cloned = new Template();
        cloned.setOrganization(org);
        cloned.setName(original.getName() + " (Copy)");
        cloned.setDescription(original.getDescription());
        cloned.setTemplateType(original.getTemplateType());
        cloned.setIsClientFacing(original.getIsClientFacing());
        cloned.setIsActive(original.getIsActive());
        cloned.setSettings(original.getSettings());
        cloned.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        cloned = templateRepository.save(cloned);

        List<TemplateItem> originalItems = templateItemRepository.findByTemplateIdOrderByDisplayOrderAsc(id);
        for (TemplateItem item : originalItems) {
            TemplateItem clonedItem = new TemplateItem();
            clonedItem.setOrganization(org);
            clonedItem.setTemplate(cloned);
            clonedItem.setItemType(item.getItemType());
            clonedItem.setProduct(item.getProduct());
            clonedItem.setCategory(item.getCategory());
            clonedItem.setLabel(item.getLabel());
            clonedItem.setDescription(item.getDescription());
            clonedItem.setDefaultQuantity(item.getDefaultQuantity());
            clonedItem.setDefaultUnitPrice(item.getDefaultUnitPrice());
            clonedItem.setDefaultUnit(item.getDefaultUnit());
            clonedItem.setFieldType(item.getFieldType());
            clonedItem.setFieldOptions(item.getFieldOptions());
            clonedItem.setIsRequired(item.getIsRequired());
            clonedItem.setDependsOnValue(item.getDependsOnValue());
            clonedItem.setSection(item.getSection());
            clonedItem.setDisplayOrder(item.getDisplayOrder());
            templateItemRepository.save(clonedItem);
        }

        return cloned;
    }

    public TemplateApplyResponse apply(UUID id, TemplateApplyRequest request) {
        get(id);
        // Template application is a placeholder - returns the template id as entity id
        // In a full implementation, this would create quotes/projects/contracts from template items
        TemplateApplyResponse response = new TemplateApplyResponse();
        response.setEntityType(request.getEntityType().getValue());
        response.setEntityId(id);
        return response;
    }

    // Template Items
    public List<TemplateItem> listItems(UUID templateId) {
        get(templateId);
        return templateItemRepository.findByTemplateIdOrderByDisplayOrderAsc(templateId);
    }

    public TemplateItem createItem(UUID templateId, CreateTemplateItemRequest request) {
        Template template = get(templateId);
        TemplateItem item = new TemplateItem();
        item.setOrganization(template.getOrganization());
        item.setTemplate(template);
        item.setItemType(request.getItemType());
        item.setLabel(request.getLabel());
        if (request.getProductId() != null) item.setProduct(productRepository.findById(request.getProductId()).orElse(null));
        if (request.getCategoryId() != null) item.setCategory(categoryRepository.findById(request.getCategoryId()).orElse(null));
        if (request.getDescription() != null) item.setDescription(request.getDescription());
        if (request.getDefaultQuantity() != null) item.setDefaultQuantity(request.getDefaultQuantity());
        if (request.getDefaultUnitPrice() != null) item.setDefaultUnitPrice(request.getDefaultUnitPrice());
        if (request.getDefaultUnit() != null) item.setDefaultUnit(request.getDefaultUnit());
        if (request.getFieldType() != null) item.setFieldType(request.getFieldType());
        if (request.getFieldOptions() != null) item.setFieldOptions((Map<String, Object>) request.getFieldOptions());
        if (request.getIsRequired() != null) item.setIsRequired(request.getIsRequired());
        if (request.getDependsOnItemId() != null) item.setDependsOnItem(templateItemRepository.findById(request.getDependsOnItemId()).orElse(null));
        if (request.getDependsOnValue() != null) item.setDependsOnValue(request.getDependsOnValue());
        if (request.getSection() != null) item.setSection(request.getSection());
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder());
        return templateItemRepository.save(item);
    }

    public TemplateItem updateItem(UUID templateId, UUID itemId, UpdateTemplateItemRequest request) {
        get(templateId);
        TemplateItem item = templateItemRepository.findById(itemId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Template item not found"));
        if (request.getLabel() != null) item.setLabel(request.getLabel().orElse(item.getLabel()));
        if (request.getDescription() != null) item.setDescription(request.getDescription().orElse(item.getDescription()));
        if (request.getDefaultQuantity() != null) item.setDefaultQuantity(request.getDefaultQuantity().orElse(item.getDefaultQuantity()));
        if (request.getDefaultUnitPrice() != null) item.setDefaultUnitPrice(request.getDefaultUnitPrice().orElse(item.getDefaultUnitPrice()));
        if (request.getDefaultUnit() != null) item.setDefaultUnit(request.getDefaultUnit().orElse(item.getDefaultUnit()));
        if (request.getFieldType() != null) item.setFieldType(request.getFieldType().orElse(item.getFieldType()));
        if (request.getFieldOptions() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> opts = (Map<String, Object>) request.getFieldOptions().orElse(item.getFieldOptions());
            item.setFieldOptions(opts);
        }
        if (request.getIsRequired() != null) item.setIsRequired(request.getIsRequired().orElse(item.getIsRequired()));
        if (request.getSection() != null) item.setSection(request.getSection().orElse(item.getSection()));
        if (request.getDisplayOrder() != null) item.setDisplayOrder(request.getDisplayOrder().orElse(item.getDisplayOrder()));
        return templateItemRepository.save(item);
    }

    public void deleteItem(UUID templateId, UUID itemId) {
        get(templateId);
        templateItemRepository.deleteById(itemId);
    }
}
