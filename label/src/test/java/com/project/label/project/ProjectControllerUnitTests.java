package com.project.label.project;

import com.project.label.project.controller.ProjectController;
import com.project.label.project.dto.ProjectRequest;
import com.project.label.project.dto.ProjectResponse;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.service.ProjectService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectControllerUnitTests {

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private ProjectController projectController;

    @Test
    void shouldCreateProjectSuccessfully() {
        ProjectResponse response = ProjectResponse.builder()
                .id(1L)
                .name("Project API")
                .description("Project from controller test")
                .status(ProjectStatus.DRAFT)
                .totalItems(0)
                .labeledItems(0)
                .reviewedItems(0)
                .approvedItems(0)
                .progressPercent(0.0)
                .build();

        when(projectService.create(any(ProjectRequest.class))).thenReturn(response);

        ResponseEntity<ProjectResponse> result = projectController.createProject(new ProjectRequest());

        Assertions.assertEquals(200, result.getStatusCode().value());
        Assertions.assertNotNull(result.getBody());
        Assertions.assertEquals(1L, result.getBody().getId());
        Assertions.assertEquals(ProjectStatus.DRAFT, result.getBody().getStatus());
    }
}
