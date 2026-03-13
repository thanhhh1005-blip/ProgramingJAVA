package com.company.employee;

import java.util.List;

public class GenerateEmployeeReportUseCase {
    private final EmployeeReportService service;

    public GenerateEmployeeReportUseCase(EmployeeReportService service) {
        this.service = service;
    }

    public void execute(List<Employee> employees) {
        service.generateReport(employees);
    }
}
