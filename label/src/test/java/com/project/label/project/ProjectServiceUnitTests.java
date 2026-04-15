package com.project.label.project;

import com.project.label.project.dto.ProjectRequest;
import com.project.label.project.dto.ProjectResponse;
import com.project.label.project.entity.Project;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.repository.ProjectRepository;
import com.project.label.project.service.ProjectService;
import com.project.label.repository.ITaskRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceUnitTests {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ITaskRepository taskRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void shouldCreateProjectWithDraftStatusAndZeroProgress() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Project A");
        request.setDescription("Demo project");

        when(projectRepository.save(any(Project.class))).thenAnswer(invocation -> {
            Project project = invocation.getArgument(0);
            project.setId(1L);
            return project;
        });

        ProjectResponse response = projectService.create(request);

        Assertions.assertEquals(1L, response.getId());
        Assertions.assertEquals(ProjectStatus.DRAFT, response.getStatus());
        Assertions.assertEquals(0, response.getTotalItems());
        Assertions.assertEquals(0.0, response.getProgressPercent());
    }
}
