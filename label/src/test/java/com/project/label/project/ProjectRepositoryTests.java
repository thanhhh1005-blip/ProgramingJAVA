package com.project.label.project;

import com.project.label.project.entity.Project;
import com.project.label.project.enums.ProjectStatus;
import com.project.label.project.repository.ProjectRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProjectRepositoryTests {

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void shouldSaveAndFindProjectById() {
        Project project = Project.builder()
                .name("Repo Test Project")
                .description("Persistence check")
                .status(ProjectStatus.DRAFT)
                .totalItems(10)
                .labeledItems(2)
                .reviewedItems(1)
                .approvedItems(1)
                .build();

        Project saved = projectRepository.save(project);

        Project found = projectRepository.findById(saved.getId()).orElseThrow();
        Assertions.assertEquals("Repo Test Project", found.getName());
        Assertions.assertEquals(ProjectStatus.DRAFT, found.getStatus());
    }
}
