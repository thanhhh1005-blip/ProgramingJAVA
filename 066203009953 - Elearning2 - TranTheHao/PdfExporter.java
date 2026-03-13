package com.company.employee;

import java.util.List;

public class PdfExporter implements ReportExporter {
    @Override
    public void export(List<Employee> employees) {
        System.out.println("Exporting PDF report");
        for (Employee e : employees) {
            System.out.println(e.getName() + " - " + e.getDepartment());
        }
    }
}
