package com.project.label.project.controller;

import com.project.label.entity.Task;
import com.project.label.project.dto.ProjectProgressRequest;
import com.project.label.project.dto.ProjectRequest;
import com.project.label.project.dto.ProjectResponse;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(@RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateProjectStatus(
            @PathVariable Long id,
            @RequestParam ProjectStatus status) {
        return ResponseEntity.ok(projectService.updateStatus(id, status));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<ProjectResponse> updateProjectProgress(
            @PathVariable Long id,
            @RequestBody ProjectProgressRequest request) {
        return ResponseEntity.ok(projectService.updateProgress(id, request));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<ProjectResponse> archiveProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.archive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProject(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Project deleted successfully."));
    }

    @PostMapping("/{projectId}/tasks/{taskId}")
    public ResponseEntity<Task> assignTaskToProject(
            @PathVariable Long projectId,
            @PathVariable String taskId) {
        return ResponseEntity.ok(projectService.assignTaskToProject(projectId, taskId));
    }

    @GetMapping("/{projectId}/tasks")
    public ResponseEntity<List<Task>> getProjectTasks(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getTasksByProject(projectId));
    }
}
