import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DataManagerService } from 'src/app/services/data-manager.service';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  constructor(
    private datePipe: DatePipe,
    private router: Router,
    private translate: TranslateService,
    private dataManager: DataManagerService
  ) {}

  keywords: any[];

  private date: any;

  private label1 = '';
  private label2 = '';

  async ngOnInit() {
    const today = new Date();
    this.date = this.datePipe.transform(today, 'yyyy_MM_dd');

    this.keywords = this.dataManager.keywords.map((kw) => kw.value);
    if (this.keywords?.length === 0) {
      this.router.navigate(['/home']);
    }

    this.label1 = await firstValueFrom(this.translate.get('KEYWORDS')); // Mots clés
    this.label2 = await firstValueFrom(this.translate.get('ADMIN.LABEL2')); // mots_cles_
  }

  exportToExcel(jsonData: any[], fileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, fileName + '.xlsx');
  }

  exportStringsAsExcel(): void {
    if (Array.isArray(this.keywords)) {
      const jsonData = this.keywords.map((item) => ({ [this.label1]: item }));
      this.exportToExcel(jsonData, this.label2 + this.date);
    }
  }
}
