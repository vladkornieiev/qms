package com.kfdlabs.asap.service;

import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.entity.Client;
import com.kfdlabs.asap.entity.InventoryItem;
import com.kfdlabs.asap.entity.Organization;
import com.kfdlabs.asap.entity.Product;
import com.kfdlabs.asap.entity.Project;
import com.kfdlabs.asap.entity.ProjectDateRange;
import com.kfdlabs.asap.entity.ProjectProduct;
import com.kfdlabs.asap.entity.ProjectResource;
import com.kfdlabs.asap.entity.Resource;
import com.kfdlabs.asap.entity.Vendor;
import com.kfdlabs.asap.mapper.ProjectMapper;
import com.kfdlabs.asap.repository.*;
import com.kfdlabs.asap.security.SecurityUtils;
import com.kfdlabs.asap.util.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectDateRangeRepository dateRangeRepository;
    private final ProjectResourceRepository projectResourceRepository;
    private final ProjectProductRepository projectProductRepository;
    private final OrganizationRepository organizationRepository;
    private final ClientRepository clientRepository;
    private final ResourceRepository resourceRepository;
    private final ProductRepository productRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final ProjectMapper projectMapper;

    private Organization getCurrentOrg() {
        return organizationRepository.findById(SecurityUtils.getCurrentOrganizationId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Organization not found"));
    }

    private String generateProjectNumber(Organization org) {
        long count = projectRepository.count();
        return String.format("PRJ-%05d", count + 1);
    }

    // ========= Projects =========

    public Page<Project> listProjects(String query, String status, UUID clientId,
                                       Integer page, Integer size, String sort) {
        String sortField = "createdAt";
        String order = "desc";
        if (sort != null && sort.contains(",")) {
            String[] parts = sort.split(",");
            sortField = parts[0];
            order = parts.length > 1 ? parts[1] : "asc";
        }
        return projectRepository.findAll(SecurityUtils.getCurrentOrganizationId(),
                query, status, clientId, PaginationUtils.getPageable(page, size, order, sortField));
    }

    public Project getProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!project.getOrganization().getId().equals(SecurityUtils.getCurrentOrganizationId())) {
            throw new HttpClientErrorException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return project;
    }

    public ProjectDetailResponse getProjectDetail(UUID id) {
        Project project = getProject(id);
        List<ProjectDateRange> dateRanges = dateRangeRepository.findByProjectIdOrderByDisplayOrderAsc(id);
        List<ProjectResource> resources = projectResourceRepository.findByProjectId(id);
        List<ProjectProduct> products = projectProductRepository.findByProjectId(id);
        return projectMapper.toDetailDTO(project, dateRanges, resources, products);
    }

    public Project createProject(CreateProjectRequest request) {
        Organization org = getCurrentOrg();
        Project project = new Project();
        project.setOrganization(org);
        project.setProjectNumber(generateProjectNumber(org));
        project.setTitle(request.getTitle());
        if (request.getClientId() != null) {
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Client not found"));
            project.setClient(client);
        }
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getPriority() != null) project.setPriority(request.getPriority());
        if (request.getVenueName() != null) project.setVenueName(request.getVenueName());
        if (request.getLocation() != null) project.setLocation(request.getLocation());
        if (request.getOnsiteContact() != null) project.setOnsiteContact(request.getOnsiteContact());
        if (request.getExternalAccountingId() != null) project.setExternalAccountingId(request.getExternalAccountingId());
        if (request.getSource() != null) project.setSource(request.getSource());
        if (request.getCustomFields() != null) project.setCustomFields(request.getCustomFields());
        project.setCreatedBy(userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null));
        return projectRepository.save(project);
    }

    public Project updateProject(UUID id, UpdateProjectRequest request) {
        Project project = getProject(id);
        if (request.getTitle() != null) project.setTitle(request.getTitle().orElse(project.getTitle()));
        if (request.getDescription() != null) project.setDescription(request.getDescription().orElse(project.getDescription()));
        if (request.getPriority() != null) project.setPriority(request.getPriority().orElse(project.getPriority()));
        if (request.getVenueName() != null) project.setVenueName(request.getVenueName().orElse(project.getVenueName()));
        if (request.getLocation() != null) project.setLocation(request.getLocation().orElse(project.getLocation()));
        if (request.getOnsiteContact() != null) project.setOnsiteContact(request.getOnsiteContact().orElse(project.getOnsiteContact()));
        if (request.getExternalAccountingId() != null) project.setExternalAccountingId(request.getExternalAccountingId().orElse(project.getExternalAccountingId()));
        if (request.getSource() != null) project.setSource(request.getSource().orElse(project.getSource()));
        if (request.getCustomFields() != null) project.setCustomFields(request.getCustomFields().orElse(project.getCustomFields()));
        if (request.getClientId() != null) {
            UUID cId = request.getClientId().orElse(null);
            if (cId != null) {
                project.setClient(clientRepository.findById(cId).orElse(null));
            } else {
                project.setClient(null);
            }
        }
        return projectRepository.save(project);
    }

    public Project updateStatus(UUID id, ProjectStatusTransition transition) {
        Project project = getProject(id);
        project.setStatus(transition.getStatus());
        return projectRepository.save(project);
    }

    public void deleteProject(UUID id) {
        Project project = getProject(id);
        projectRepository.delete(project);
    }

    // ========= Date Ranges =========

    public List<ProjectDateRange> listDateRanges(UUID projectId) {
        getProject(projectId);
        return dateRangeRepository.findByProjectIdOrderByDisplayOrderAsc(projectId);
    }

    public ProjectDateRange createDateRange(UUID projectId, CreateProjectDateRangeRequest request) {
        Project project = getProject(projectId);
        ProjectDateRange dr = new ProjectDateRange();
        dr.setOrganization(project.getOrganization());
        dr.setProject(project);
        dr.setDateStart(request.getDateStart());
        dr.setDateEnd(request.getDateEnd());
        if (request.getLabel() != null) dr.setLabel(request.getLabel());
        if (request.getRateMultiplier() != null) dr.setRateMultiplier(request.getRateMultiplier());
        if (request.getNotes() != null) dr.setNotes(request.getNotes());
        if (request.getDisplayOrder() != null) dr.setDisplayOrder(request.getDisplayOrder());
        return dateRangeRepository.save(dr);
    }

    public ProjectDateRange updateDateRange(UUID projectId, UUID rangeId, UpdateProjectDateRangeRequest request) {
        getProject(projectId);
        ProjectDateRange dr = dateRangeRepository.findById(rangeId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Date range not found"));
        if (request.getDateStart() != null) dr.setDateStart(request.getDateStart().orElse(dr.getDateStart()));
        if (request.getDateEnd() != null) dr.setDateEnd(request.getDateEnd().orElse(dr.getDateEnd()));
        if (request.getLabel() != null) dr.setLabel(request.getLabel().orElse(dr.getLabel()));
        if (request.getRateMultiplier() != null) dr.setRateMultiplier(request.getRateMultiplier().orElse(dr.getRateMultiplier()));
        if (request.getNotes() != null) dr.setNotes(request.getNotes().orElse(dr.getNotes()));
        if (request.getDisplayOrder() != null) dr.setDisplayOrder(request.getDisplayOrder().orElse(dr.getDisplayOrder()));
        return dateRangeRepository.save(dr);
    }

    public void deleteDateRange(UUID projectId, UUID rangeId) {
        getProject(projectId);
        dateRangeRepository.deleteById(rangeId);
    }

    // ========= Resources =========

    public List<ProjectResource> listProjectResources(UUID projectId) {
        getProject(projectId);
        return projectResourceRepository.findByProjectId(projectId);
    }

    public ProjectResource assignResource(UUID projectId, CreateProjectResourceRequest request) {
        Project project = getProject(projectId);
        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Resource not found"));
        ProjectResource pr = new ProjectResource();
        pr.setOrganization(project.getOrganization());
        pr.setProject(project);
        pr.setResource(resource);
        if (request.getRole() != null) pr.setRole(request.getRole());
        if (request.getBillRate() != null) pr.setBillRate(request.getBillRate());
        if (request.getPayRate() != null) pr.setPayRate(request.getPayRate());
        if (request.getRateUnit() != null) pr.setRateUnit(request.getRateUnit());
        if (request.getPerDiem() != null) pr.setPerDiem(request.getPerDiem());
        if (request.getDateRangeIds() != null) pr.setDateRangeIds(request.getDateRangeIds());
        if (request.getNotes() != null) pr.setNotes(request.getNotes());
        return projectResourceRepository.save(pr);
    }

    public ProjectResource updateProjectResource(UUID projectId, UUID prId, UpdateProjectResourceRequest request) {
        getProject(projectId);
        ProjectResource pr = projectResourceRepository.findById(prId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project resource not found"));
        if (request.getRole() != null) pr.setRole(request.getRole().orElse(pr.getRole()));
        if (request.getBillRate() != null) pr.setBillRate(request.getBillRate().orElse(pr.getBillRate()));
        if (request.getPayRate() != null) pr.setPayRate(request.getPayRate().orElse(pr.getPayRate()));
        if (request.getRateUnit() != null) pr.setRateUnit(request.getRateUnit().orElse(pr.getRateUnit()));
        if (request.getPerDiem() != null) pr.setPerDiem(request.getPerDiem().orElse(pr.getPerDiem()));
        if (request.getDateRangeIds() != null) pr.setDateRangeIds(request.getDateRangeIds().orElse(pr.getDateRangeIds()));
        if (request.getNotes() != null) pr.setNotes(request.getNotes().orElse(pr.getNotes()));
        return projectResourceRepository.save(pr);
    }

    public ProjectResource confirmResource(UUID projectId, UUID prId) {
        getProject(projectId);
        ProjectResource pr = projectResourceRepository.findById(prId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project resource not found"));
        pr.setStatus("confirmed");
        pr.setConfirmedAt(LocalDateTime.now());
        return projectResourceRepository.save(pr);
    }

    public void removeResource(UUID projectId, UUID prId) {
        getProject(projectId);
        projectResourceRepository.deleteById(prId);
    }

    // ========= Products =========

    public List<ProjectProduct> listProjectProducts(UUID projectId) {
        getProject(projectId);
        return projectProductRepository.findByProjectId(projectId);
    }

    public ProjectProduct assignProduct(UUID projectId, CreateProjectProductRequest request) {
        Project project = getProject(projectId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Product not found"));
        ProjectProduct pp = new ProjectProduct();
        pp.setOrganization(project.getOrganization());
        pp.setProject(project);
        pp.setProduct(product);
        if (request.getInventoryItemId() != null) {
            pp.setInventoryItem(inventoryItemRepository.findById(request.getInventoryItemId()).orElse(null));
        }
        if (request.getVendorId() != null) {
            pp.setVendor(vendorRepository.findById(request.getVendorId()).orElse(null));
        }
        if (request.getQuantity() != null) pp.setQuantity(request.getQuantity());
        if (request.getBillRate() != null) pp.setBillRate(request.getBillRate());
        if (request.getCostRate() != null) pp.setCostRate(request.getCostRate());
        if (request.getRateUnit() != null) pp.setRateUnit(request.getRateUnit());
        if (request.getNotes() != null) pp.setNotes(request.getNotes());
        return projectProductRepository.save(pp);
    }

    public ProjectProduct updateProjectProduct(UUID projectId, UUID ppId, UpdateProjectProductRequest request) {
        getProject(projectId);
        ProjectProduct pp = projectProductRepository.findById(ppId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project product not found"));
        if (request.getVendorId() != null) {
            UUID vId = request.getVendorId().orElse(null);
            if (vId != null) {
                pp.setVendor(vendorRepository.findById(vId).orElse(null));
            } else {
                pp.setVendor(null);
            }
        }
        if (request.getQuantity() != null) pp.setQuantity(request.getQuantity().orElse(pp.getQuantity()));
        if (request.getBillRate() != null) pp.setBillRate(request.getBillRate().orElse(pp.getBillRate()));
        if (request.getCostRate() != null) pp.setCostRate(request.getCostRate().orElse(pp.getCostRate()));
        if (request.getRateUnit() != null) pp.setRateUnit(request.getRateUnit().orElse(pp.getRateUnit()));
        if (request.getNotes() != null) pp.setNotes(request.getNotes().orElse(pp.getNotes()));
        return projectProductRepository.save(pp);
    }

    public ProjectProduct checkOutProduct(UUID projectId, UUID ppId) {
        getProject(projectId);
        ProjectProduct pp = projectProductRepository.findById(ppId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project product not found"));
        pp.setStatus("checked_out");
        pp.setCheckedOutAt(LocalDateTime.now());
        if (pp.getInventoryItem() != null) {
            InventoryItem item = pp.getInventoryItem();
            item.setStatus("checked_out");
            inventoryItemRepository.save(item);
        }
        return projectProductRepository.save(pp);
    }

    public ProjectProduct returnProduct(UUID projectId, UUID ppId) {
        getProject(projectId);
        ProjectProduct pp = projectProductRepository.findById(ppId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Project product not found"));
        pp.setStatus("returned");
        pp.setReturnedAt(LocalDateTime.now());
        if (pp.getInventoryItem() != null) {
            InventoryItem item = pp.getInventoryItem();
            item.setStatus("available");
            inventoryItemRepository.save(item);
        }
        return projectProductRepository.save(pp);
    }

    public void removeProduct(UUID projectId, UUID ppId) {
        getProject(projectId);
        projectProductRepository.deleteById(ppId);
    }

    // ========= Recalculate =========

    public Project recalculateTotals(UUID id) {
        Project project = getProject(id);
        List<ProjectDateRange> dateRanges = dateRangeRepository.findByProjectIdOrderByDisplayOrderAsc(id);
        List<ProjectResource> resources = projectResourceRepository.findByProjectId(id);
        List<ProjectProduct> products = projectProductRepository.findByProjectId(id);

        BigDecimal totalBillable = BigDecimal.ZERO;
        BigDecimal totalCost = BigDecimal.ZERO;

        for (ProjectResource pr : resources) {
            BigDecimal days = BigDecimal.ZERO;
            if (pr.getDateRangeIds() != null && !pr.getDateRangeIds().isEmpty()) {
                for (UUID drId : pr.getDateRangeIds()) {
                    for (ProjectDateRange dr : dateRanges) {
                        if (dr.getId().equals(drId)) {
                            long dayCount = ChronoUnit.DAYS.between(dr.getDateStart(), dr.getDateEnd()) + 1;
                            days = days.add(BigDecimal.valueOf(dayCount).multiply(dr.getRateMultiplier()));
                        }
                    }
                }
            }
            if (pr.getBillRate() != null) totalBillable = totalBillable.add(pr.getBillRate().multiply(days));
            if (pr.getPayRate() != null) totalCost = totalCost.add(pr.getPayRate().multiply(days));
            if (pr.getPerDiem() != null) totalCost = totalCost.add(pr.getPerDiem().multiply(days));
        }

        for (ProjectProduct pp : products) {
            BigDecimal qty = pp.getQuantity() != null ? pp.getQuantity() : BigDecimal.ONE;
            if (pp.getBillRate() != null) totalBillable = totalBillable.add(pp.getBillRate().multiply(qty));
            if (pp.getCostRate() != null) totalCost = totalCost.add(pp.getCostRate().multiply(qty));
        }

        project.setTotalBillable(totalBillable);
        project.setTotalCost(totalCost);
        project.setTotalProfit(totalBillable.subtract(totalCost));
        return projectRepository.save(project);
    }

    // ========= Calendar =========

    public List<ProjectCalendarEntry> getCalendar(LocalDate start, LocalDate end) {
        UUID orgId = SecurityUtils.getCurrentOrganizationId();
        List<ProjectDateRange> dateRanges = dateRangeRepository.findByDateRange(orgId, start, end);
        return dateRanges.stream().map(dr -> {
            ProjectCalendarEntry entry = new ProjectCalendarEntry();
            Project p = dr.getProject();
            entry.setProjectId(p.getId());
            entry.setProjectNumber(p.getProjectNumber());
            entry.setTitle(p.getTitle());
            entry.setStatus(p.getStatus());
            entry.setClientName(p.getClient() != null ? p.getClient().getName() : null);
            entry.setDateStart(dr.getDateStart());
            entry.setDateEnd(dr.getDateEnd());
            entry.setLabel(dr.getLabel());
            return entry;
        }).toList();
    }
}
