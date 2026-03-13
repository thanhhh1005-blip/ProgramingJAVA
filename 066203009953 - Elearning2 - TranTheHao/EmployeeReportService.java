package com.company.employee;

import java.util.List;

public class EmployeeReportService {
    private final ReportExporter exporter;

    public EmployeeReportService(ReportExporter exporter) {
        this.exporter = exporter;
    }

    public void generateReport(List<Employee> employees) {
        exporter.export(employees);
    }
}
