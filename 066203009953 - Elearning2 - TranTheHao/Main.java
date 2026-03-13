package com.company.employee;

import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Employee> employees = List.of(
                new Employee("Alice", "IT"),
                new Employee("Bob", "HR")
        );

        ReportExporter exporter = ExportFactory.create("excel");
        EmployeeReportService reportService = new EmployeeReportService(exporter);
        GenerateEmployeeReportUseCase useCase = new GenerateEmployeeReportUseCase(reportService);
        useCase.execute(employees);

        LoggerPort logger = new AppLogger();
        MailSender mailSender = new MailService(logger);
        mailSender.send("050903tth@gmail.com", "Hello tranthehao, report generated successfully.");

        Vit vitCo = new VitCo();
        vitCo.run();
    }
}
