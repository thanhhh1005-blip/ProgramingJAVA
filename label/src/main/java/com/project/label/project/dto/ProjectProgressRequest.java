package com.project.label.project.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProjectProgressRequest {
    private Integer totalItems;
    private Integer labeledItems;
    private Integer reviewedItems;
    private Integer approvedItems;
}
