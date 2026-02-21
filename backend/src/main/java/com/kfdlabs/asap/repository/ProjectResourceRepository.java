package com.kfdlabs.asap.repository;

import com.kfdlabs.asap.entity.ProjectResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectResourceRepository extends JpaRepository<ProjectResource, UUID> {

    List<ProjectResource> findByProjectId(UUID projectId);

    List<ProjectResource> findByResourceId(UUID resourceId);
}
