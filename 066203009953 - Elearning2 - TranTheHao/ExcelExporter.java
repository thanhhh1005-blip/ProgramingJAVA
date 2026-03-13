package com.company.employee;

import java.util.List;

public class ExcelExporter implements ReportExporter {
    @Override
    public void export(List<Employee> employees) {
        System.out.println("Exporting Excel report");
        for (Employee e : employees) {
            System.out.println(e.getName() + " - " + e.getDepartment());
        }
    }
}
