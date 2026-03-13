package com.company.employee;

public class ExportFactory {
    public static ReportExporter create(String type) {
        switch (type.toLowerCase()) {
            case "excel":
                return new ExcelExporter();
            case "pdf":
                return new PdfExporter();
            default:
                throw new IllegalArgumentException("Unsupported export type: " + type);
        }
    }
}
