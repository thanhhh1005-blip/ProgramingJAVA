package com.project.label.project.service;

import com.project.label.entity.Task;
import com.project.label.project.dto.ProjectProgressRequest;
import com.project.label.project.dto.ProjectRequest;
import com.project.label.project.dto.ProjectResponse;
import com.project.label.project.entity.Project;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.repository.ProjectRepository;
import com.project.label.repository.ITaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ITaskRepository taskRepository;

    public ProjectResponse create(ProjectRequest request) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(ProjectStatus.DRAFT)
                .totalItems(0)
                .labeledItems(0)
                .reviewedItems(0)
                .approvedItems(0)
                .build();
        return toResponse(projectRepository.save(project));
    }

    public List<ProjectResponse> getAll() {
        return projectRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ProjectResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    public ProjectResponse update(Long id, ProjectRequest request) {
        Project project = getEntityById(id);

        if (request.getName() != null && !request.getName().isBlank()) {
            project.setName(request.getName());
        }
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription());
        }

        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse updateStatus(Long id, ProjectStatus status) {
        Project project = getEntityById(id);
        project.setStatus(status);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse updateProgress(Long id, ProjectProgressRequest request) {
        Project project = getEntityById(id);
        if (request.getTotalItems() != null) {
            project.setTotalItems(request.getTotalItems());
        }
        if (request.getLabeledItems() != null) {
            project.setLabeledItems(request.getLabeledItems());
        }
        if (request.getReviewedItems() != null) {
            project.setReviewedItems(request.getReviewedItems());
        }
        if (request.getApprovedItems() != null) {
            project.setApprovedItems(request.getApprovedItems());
        }

        return toResponse(projectRepository.save(project));
    }

    public ProjectResponse archive(Long id) {
        Project project = getEntityById(id);
        project.setStatus(ProjectStatus.ARCHIVED);
        return toResponse(projectRepository.save(project));
    }

    public void delete(Long id) {
        Project project = getEntityById(id);
        projectRepository.delete(project);
    }

    @Transactional
    public Task assignTaskToProject(Long projectId, String taskId) {
        Project project = getEntityById(projectId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found."));

        task.setProject(project);
        return taskRepository.save(task);
    }

    public List<Task> getTasksByProject(Long projectId) {
        getEntityById(projectId);
        return taskRepository.findByProjectId(projectId);
    }

    private Project getEntityById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    private ProjectResponse toResponse(Project project) {
        int total = project.getTotalItems() == null ? 0 : project.getTotalItems();
        int approved = project.getApprovedItems() == null ? 0 : project.getApprovedItems();
        double progress = total == 0 ? 0.0 : (approved * 100.0) / total;

        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .totalItems(total)
                .labeledItems(project.getLabeledItems() == null ? 0 : project.getLabeledItems())
                .reviewedItems(project.getReviewedItems() == null ? 0 : project.getReviewedItems())
                .approvedItems(approved)
                .progressPercent(progress)
                .build();
    }
}
