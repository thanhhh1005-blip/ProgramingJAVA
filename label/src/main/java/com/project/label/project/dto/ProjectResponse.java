package com.project.label.project.dto;

import com.project.label.project.enums.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private ProjectStatus status;
    private Integer totalItems;
    private Integer labeledItems;
    private Integer reviewedItems;
    private Integer approvedItems;
    private Double progressPercent;
}
