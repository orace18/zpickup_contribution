import { CommonModule } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { FinancialCard, GainHistory } from './models/gains.model';
import { GainsService } from './services/gains.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-gains',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    NgbDropdownModule
  ],
  templateUrl: './gains.component.html',
  styleUrl: './gains.component.css',
})
export class GainsComponent implements OnInit {
  racesHistory$: Observable<GainHistory[]>;
  startDate: string = '';
  endDate: string = '';
  originalData: GainHistory[] = [];
  private modalRef: NgbModalRef | null = null;
  private gainsSubject = new BehaviorSubject<GainHistory[]>([]);
  today: string = new Date().toISOString().split('T')[0];

  @ViewChild('periodModal') periodModal!: ElementRef;

  constructor(
    public gainsService: GainsService,
    private modalService: NgbModal
  ) {
    this.racesHistory$ = this.gainsSubject.asObservable();
  }

  cards: FinancialCard[] = [
    {
      title: 'Gain Client',
      amount: 0,
      icon: 'person-circle',
      color: 'primary'
    },
    {
      title: 'Gain ZPickup',
      amount: 0,
      icon: 'building',
      color: 'success'
    },
    {
      title: 'Gain Transporteur',
      amount: 0,
      icon: 'truck',
      color: 'warning'
    }
  ];

  ngOnInit(): void {
    console.log('Gains component initialized');
    
    // Chargement initial des données
    this.gainsService.getGains().subscribe(data => {
      console.log('Données reçues:', data);
      this.originalData = data;
      this.gainsSubject.next(data);
    });

    this.gainsService.getZemRaces().subscribe(
      gains => {
        if (gains && typeof gains === 'object') {
          this.cards[0].amount = Number(gains.customer_bonus) || 0;
          this.cards[2].amount = Number(gains.zem_bonus) || 0;
          this.cards[1].amount = Number(gains.admin_bonus) || 0;
        } else {
          console.error('Invalid gains data:', gains);
        }
      },
      error => {
        console.error('Error in ngOnInit:', error);
      }
    );
  }

  openModal(content: TemplateRef<any>) {
    this.modalRef = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false
    });
  }

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  applyDateFilter() {
    if (!this.startDate || !this.endDate) {
      return;
    }

    console.log('Applying filter:', this.startDate, this.endDate);
    console.log('Original data:', this.originalData);

    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const filteredData = this.originalData.filter(item => {
      try {
        const itemDate = this.parseFrenchDate(item.date);
        return itemDate >= startDate && itemDate <= endDate;
      } catch (error) {
        console.error('Error parsing date:', item.date, error);
        return false;
      }
    });

    console.log('Filtered data:', filteredData);
    this.gainsSubject.next(filteredData);
    this.closeModal();
  }

  resetDateFilter() {
    this.startDate = '';
    this.endDate = '';
    this.gainsSubject.next(this.originalData);
    this.closeModal();
  }

  private prepareExportData(): any[] {
    return this.gainsSubject.value.map(item => ({
      'Date': item.date,
      'Bonus Zem': item.zem_bonus,
      'Bonus Client': item.customer_bonus,
      'Bonus Admin': item.admin_bonus,
      'Total': item.total
    }));
  }

  exportToExcel() {
    const data = this.prepareExportData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'gains-report.xlsx');
  }

  exportToCsv() {
    const data = this.prepareExportData();
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'gains-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToPdf() {
    const doc = new jsPDF();
    const data = this.prepareExportData();
    
    doc.text('Rapport des Gains', 14, 15);
    
    autoTable(doc, {
      head: [['Date', 'Bonus Zem', 'Bonus Client', 'Bonus Admin', 'Total']],
      body: data.map(row => [
        row.Date,
        `${row['Bonus Zem']} FCFA`,
        `${row['Bonus Client']} FCFA`,
        `${row['Bonus Admin']} FCFA`,
        `${row.Total} FCFA`
      ])
    });

    doc.save('gains-report.pdf');
  }

  private parseFrenchDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }


}