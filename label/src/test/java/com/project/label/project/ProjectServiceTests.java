package com.project.label.project;

import com.project.label.entity.Task;
import com.project.label.enums.TaskStatus;
import com.project.label.project.dto.ProjectProgressRequest;
import com.project.label.project.dto.ProjectRequest;
import com.project.label.project.dto.ProjectResponse;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.service.ProjectService;
import com.project.label.repository.ITaskRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProjectServiceTests {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ITaskRepository taskRepository;

    @Test
    void createUpdateProgressAndAssignTaskSuccessfully() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Labeling Batch A");
        request.setDescription("Project for annotation batch A");

        ProjectResponse project = projectService.create(request);
        Assertions.assertNotNull(project.getId());
        Assertions.assertEquals(ProjectStatus.DRAFT, project.getStatus());

        Task task = Task.builder()
                .dataItemId("img-0001")
                .status(TaskStatus.TODO)
                .build();
        Task savedTask = taskRepository.save(task);

        ProjectProgressRequest progressRequest = new ProjectProgressRequest();
        progressRequest.setTotalItems(10);
        progressRequest.setLabeledItems(4);
        progressRequest.setReviewedItems(2);
        progressRequest.setApprovedItems(1);

        ProjectResponse updatedProgress = projectService.updateProgress(project.getId(), progressRequest);
        Assertions.assertEquals(10, updatedProgress.getTotalItems());
        Assertions.assertEquals(1, updatedProgress.getApprovedItems());

        ProjectResponse updatedStatus = projectService.updateStatus(project.getId(), ProjectStatus.ACTIVE);
        Assertions.assertEquals(ProjectStatus.ACTIVE, updatedStatus.getStatus());

        Task assignedTask = projectService.assignTaskToProject(project.getId(), savedTask.getId());
        Assertions.assertNotNull(assignedTask.getProject());
        Assertions.assertEquals(project.getId(), assignedTask.getProject().getId());

        List<Task> tasksByProject = projectService.getTasksByProject(project.getId());
        Assertions.assertEquals(1, tasksByProject.size());
    }
}
