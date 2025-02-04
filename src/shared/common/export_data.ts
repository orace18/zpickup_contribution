import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export class ExportDataService {
    
    /**
     * Author: Orace EDJO - Work at WONDERTECK
     * Export data to CSV format
     * @param data Array of objects to export
     * @param filename Name of the file to download
     */
    public static exportToCsv(data: any[], filename: string): void {
        if (!data || !data.length) {
            return;
        }
        
        const separator = ',';
        const keys = Object.keys(data[0]);
        const csvData = 
            keys.join(separator) +
            '\n' +
            data.map(row => {
                return keys.map(k => {
                    let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                    cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
                    return cell;
                }).join(separator);
            }).join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename + '.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    /**
     * Export data to Excel format
     * @param data Array of objects to export
     * @param filename Name of the file to download
     */
    public static exportToExcel(data: any[], filename: string): void {
        if (!data || !data.length) {
            return;
        }

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        XLSX.writeFile(workbook, filename + '.xlsx');
    }

    /**
     * Export data to PDF format
     * @param data Array of objects to export
     * @param filename Name of the file to download
     * @param title Optional title for the PDF
     */
    public static exportToPdf(data: any[], filename: string, title: string = ''): void {
        if (!data || !data.length) {
            return;
        }

        const doc = new jsPDF();
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => Object.values(obj));

        if (title) {
            doc.text(title, 14, 10);
        }

        (doc as any).autoTable({
            head: [headers],
            body: rows,
            startY: title ? 20 : 10
        });

        doc.save(filename + '.pdf');
    }
}