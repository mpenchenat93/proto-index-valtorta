import { Component, ElementRef, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import * as XLSX from 'xlsx';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  @ViewChild('hiddenFileInput2') hiddenFileInput2!: ElementRef;
  @ViewChild('hiddenFileInput3') hiddenFileInput3!: ElementRef;

  oldFileName = '';
  newFileName = '';

  constructor(private translate: TranslateService) {}

  private label1 = '';
  private label3 = '';
  private label4 = '';
  private label5 = '';

  oldKeywords: string[] = [];
  actualKeywords: string[] = [];

  async ngOnInit() {
    this.label1 = await firstValueFrom(this.translate.get('KEYWORDS')); // Mots clés
    this.label3 = await firstValueFrom(this.translate.get('ADMIN.LABEL3')); // diff_mots_cles
    this.label4 = await firstValueFrom(this.translate.get('ADMIN.LABEL4')); // Mots-clés ajoutés
    this.label5 = await firstValueFrom(this.translate.get('ADMIN.LABEL5')); // Mots-clés supprimés
  }

  onKeywordsFileChangeOld(ev: any) {
    let workBook: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];

    if (!file) {
      this.oldFileName = '';
      this.oldKeywords = [];
      return;
    }

    this.oldFileName = file.name;
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: string) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});

      const oldKeywords = jsonData[Object.keys(jsonData)[0]];
      this.oldKeywords = oldKeywords.map((el: any) => el[this.label1]);
    };

    reader.readAsArrayBuffer(file);
  }

  onKeywordsFileChangeActual(ev: any) {
    let workBook: any = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = ev.target.files[0];

    if (!file) {
      this.newFileName = '';
      this.actualKeywords = [];
      return;
    }

    this.newFileName = file.name;
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: string) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});

      let actualKeywords = jsonData[Object.keys(jsonData)[0]];
      this.actualKeywords = actualKeywords.map((el: any) => el[this.label1]);
    };

    reader.readAsArrayBuffer(file);
  }

  onBtnClickOld() {
    this.hiddenFileInput2.nativeElement.value = '';
    this.hiddenFileInput2.nativeElement.click();
  }

  onBtnClickActual() {
    this.hiddenFileInput3.nativeElement.value = '';
    this.hiddenFileInput3.nativeElement.click();
  }

  downloadDiffExport() {
    if (!this.oldKeywords?.length || !this.actualKeywords?.length) return;

    const differences = this.findDifferences(
      this.oldKeywords,
      this.actualKeywords
    );

    this.generateExcelFromDifferences(
      differences.added,
      differences.removed,
      this.label3
    );

    // Reset both inputs
    this.oldFileName = '';
    this.newFileName = '';
    this.oldKeywords = [];
    this.actualKeywords = [];
  }

  // ---- Private methods

  private findDifferences(
    oldT: string[],
    newT: string[]
  ): { added: string[]; removed: string[] } {
    const added = newT.filter((item) => !oldT.includes(item));
    const removed = oldT.filter((item) => !newT.includes(item));

    return { added, removed };
  }

  private generateExcelFromDifferences(
    added: string[],
    removed: string[],
    fileName: string
  ): void {
    const maxLength = Math.max(added.length, removed.length);
    const jsonData = Array.from({ length: maxLength }).map((_, i) => ({
      [this.label4]: added[i] ?? '',
      [this.label5]: removed[i] ?? '',
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
