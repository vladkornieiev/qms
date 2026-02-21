package com.kfdlabs.asap.controller;

import com.kfdlabs.asap.api.ProjectsApi;
import com.kfdlabs.asap.dto.*;
import com.kfdlabs.asap.mapper.ProjectMapper;
import com.kfdlabs.asap.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Controller
@PreAuthorize("isAuthenticated()")
@RequiredArgsConstructor
public class ProjectController implements ProjectsApi {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @Override
    public ResponseEntity<PaginatedProjectResponse> listProjects(
            String query, String status, UUID clientId,
            Integer page, Integer size, String sort) {
        return ResponseEntity.ok(projectMapper.toPaginatedDTO(
                projectService.listProjects(query, status, clientId, page, size, sort)));
    }

    @Override
    public ResponseEntity<ProjectDetailResponse> getProjectById(UUID id) {
        return ResponseEntity.ok(projectService.getProjectDetail(id));
    }

    @Override
    public ResponseEntity<ProjectResponse> createProject(CreateProjectRequest createProjectRequest) {
        return ResponseEntity.status(201).body(projectMapper.toDTO(projectService.createProject(createProjectRequest)));
    }

    @Override
    public ResponseEntity<ProjectResponse> updateProject(UUID id, UpdateProjectRequest updateProjectRequest) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.updateProject(id, updateProjectRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteProject(UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ProjectResponse> updateProjectStatus(UUID id, ProjectStatusTransition projectStatusTransition) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.updateStatus(id, projectStatusTransition)));
    }

    // Date Ranges

    @Override
    public ResponseEntity<List<ProjectDateRangeResponse>> listProjectDateRanges(UUID id) {
        return ResponseEntity.ok(projectService.listDateRanges(id).stream()
                .map(projectMapper::toDateRangeDTO).toList());
    }

    @Override
    public ResponseEntity<ProjectDateRangeResponse> createProjectDateRange(UUID id, CreateProjectDateRangeRequest createProjectDateRangeRequest) {
        return ResponseEntity.status(201).body(projectMapper.toDateRangeDTO(
                projectService.createDateRange(id, createProjectDateRangeRequest)));
    }

    @Override
    public ResponseEntity<ProjectDateRangeResponse> updateProjectDateRange(UUID id, UUID rangeId, UpdateProjectDateRangeRequest updateProjectDateRangeRequest) {
        return ResponseEntity.ok(projectMapper.toDateRangeDTO(
                projectService.updateDateRange(id, rangeId, updateProjectDateRangeRequest)));
    }

    @Override
    public ResponseEntity<Void> deleteProjectDateRange(UUID id, UUID rangeId) {
        projectService.deleteDateRange(id, rangeId);
        return ResponseEntity.noContent().build();
    }

    // Resources

    @Override
    public ResponseEntity<List<ProjectResourceResponse>> listProjectResources(UUID id) {
        return ResponseEntity.ok(projectService.listProjectResources(id).stream()
                .map(projectMapper::toResourceDTO).toList());
    }

    @Override
    public ResponseEntity<ProjectResourceResponse> assignProjectResource(UUID id, CreateProjectResourceRequest createProjectResourceRequest) {
        return ResponseEntity.status(201).body(projectMapper.toResourceDTO(
                projectService.assignResource(id, createProjectResourceRequest)));
    }

    @Override
    public ResponseEntity<ProjectResourceResponse> updateProjectResource(UUID id, UUID prId, UpdateProjectResourceRequest updateProjectResourceRequest) {
        return ResponseEntity.ok(projectMapper.toResourceDTO(
                projectService.updateProjectResource(id, prId, updateProjectResourceRequest)));
    }

    @Override
    public ResponseEntity<Void> removeProjectResource(UUID id, UUID prId) {
        projectService.removeResource(id, prId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ProjectResourceResponse> confirmProjectResource(UUID id, UUID prId) {
        return ResponseEntity.ok(projectMapper.toResourceDTO(projectService.confirmResource(id, prId)));
    }

    // Products

    @Override
    public ResponseEntity<List<ProjectProductResponse>> listProjectProducts(UUID id) {
        return ResponseEntity.ok(projectService.listProjectProducts(id).stream()
                .map(projectMapper::toProductDTO).toList());
    }

    @Override
    public ResponseEntity<ProjectProductResponse> assignProjectProduct(UUID id, CreateProjectProductRequest createProjectProductRequest) {
        return ResponseEntity.status(201).body(projectMapper.toProductDTO(
                projectService.assignProduct(id, createProjectProductRequest)));
    }

    @Override
    public ResponseEntity<ProjectProductResponse> updateProjectProduct(UUID id, UUID ppId, UpdateProjectProductRequest updateProjectProductRequest) {
        return ResponseEntity.ok(projectMapper.toProductDTO(
                projectService.updateProjectProduct(id, ppId, updateProjectProductRequest)));
    }

    @Override
    public ResponseEntity<Void> removeProjectProduct(UUID id, UUID ppId) {
        projectService.removeProduct(id, ppId);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<ProjectProductResponse> checkOutProjectProduct(UUID id, UUID ppId) {
        return ResponseEntity.ok(projectMapper.toProductDTO(projectService.checkOutProduct(id, ppId)));
    }

    @Override
    public ResponseEntity<ProjectProductResponse> returnProjectProduct(UUID id, UUID ppId) {
        return ResponseEntity.ok(projectMapper.toProductDTO(projectService.returnProduct(id, ppId)));
    }

    // Recalculate

    @Override
    public ResponseEntity<ProjectResponse> recalculateProjectTotals(UUID id) {
        return ResponseEntity.ok(projectMapper.toDTO(projectService.recalculateTotals(id)));
    }

    // Calendar

    @Override
    public ResponseEntity<List<ProjectCalendarEntry>> getProjectCalendar(LocalDate start, LocalDate end) {
        return ResponseEntity.ok(projectService.getCalendar(start, end));
    }
}
