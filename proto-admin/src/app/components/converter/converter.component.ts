import { Component, ElementRef, Inject, ViewChild } from '@angular/core';

import { EncryptionService } from '../../services/encryption.service';

import * as XLSX from 'xlsx';
import { CRYPTO } from '../../services/token-definition.service';

@Component({
  selector: 'xlsx-to-json-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css'],
})
export class ConverterComponent {
  @ViewChild('hiddenFileInput') hiddenFileInput!: ElementRef;

  fileNames: any[] = [];

  constructor(@Inject(CRYPTO) private crypto: EncryptionService) {}

  onBtnClick() {
    this.hiddenFileInput.nativeElement.value = '';
    this.hiddenFileInput.nativeElement.click();
  }

  onFileChange(ev: any) {
    this.fileNames = [];
    const element = ev.target as HTMLInputElement;
    const files = element.files;
    if (files && files.length) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileName = file.name;
        const fileId = 'file-' + i;
        this.fileNames.push({
          id: fileId,
          json: this.getJSONFileName(fileName),
          name: fileName,
        });

        let workBook: any = null;
        let jsonData = null;
        const reader = new FileReader();
        reader.onload = (event) => {
          const data = reader.result;
          workBook = XLSX.read(data, { type: 'binary' });
          let dataString = '';
          if (fileName === 'themes.xlsx') {
            jsonData = this.convertThemes(workBook);
          } else if (fileName === 'keywords.xlsx') {
            jsonData = this.convertKeywords(workBook);
          } else {
            jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
              const sheet = workBook.Sheets[name];
              if (fileName === 'settings.xlsx') {
                return this.convertSettings(sheet);
              } else {
                initial[name] = XLSX.utils.sheet_to_json(sheet);
                return initial;
              }
            }, {});
          }

          dataString = JSON.stringify(jsonData);
          if (fileName === 'conf.xlsx') {
            dataString = this.formatConfFile(dataString);
          }

          this.setDownload(dataString, fileId);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }

  // Private methods ---

  private getJSONFileName(fileName: string) {
    if (fileName === 'conf.xlsx') {
      return 'conf.json';
    } else if (fileName === 'settings.xlsx') {
      return 'settings.json';
    } else {
      // Add generated hash
      const tt = fileName.lastIndexOf('.');
      return (
        fileName.substring(0, tt) +
        '.' +
        this.generateSimpleRandomHash() +
        '.json'
      );
    }
  }

  private getJsonNameById(index: string) {
    let tt = this.fileNames.find((el) => {
      return el.id === index;
    });
    return tt.json;
  }

  private formatConfFile(str: string) {
    const data = JSON.parse(str);
    const keys: any = Object.keys(data);
    const data2 = data[keys[0]];

    let arr: any = [];
    // Add parents
    data2.forEach((el: any) => {
      if (typeof el['EST PARENT'] === 'string') {
        arr.push(el);
      }
    });

    for (let i = 0; i < arr.length; i++) {
      let parent = arr[i];
      if (parent['EST PARENT'] === 'Oui')
        parent.TOMES = data2
          .filter((el: any) => el.PARENT === parent['ID'])
          .map((el: any) => {
            return {
              Nom: el.NOM,
              ID: el.ID,
            };
          });
    }

    return JSON.stringify(arr);
  }

  private generateSimpleRandomHash(): string {
    return Math.random().toString(36).slice(2, 11);
  }

  private setDownload(data: any, index: string) {
    setTimeout(() => {
      const el: any = document.querySelector(`#${index}`);
      el.setAttribute(
        'href',
        `data:text/json;charset=utf-8,${encodeURIComponent(data)}`
      );

      el.setAttribute('download', this.getJsonNameById(index));
    }, 1000);
  }

  private convertSettings(sheet: any) {
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    let configObject: any = {};
    data.forEach((row: any) => {
      if (row.length > 0) {
        let key = row[0];
        let value = row[1] || '';
        configObject[key] = value;
      }
    });

    if (configObject.EMAIL) {
      configObject.EMAIL = this.crypto.encrypt(configObject.EMAIL);
    }

    return configObject;
  }

  private convertThemes(workBook: any) {
    const themesSheet = workBook.Sheets[workBook.SheetNames[0]];
    const themes = XLSX.utils.sheet_to_json(themesSheet, {
      header: 1,
    });

    return themes.slice(1).map((row: any) => ({
      name: row[0],
      id: row[1],
      parentId: row[2],
    }));
  }

  private convertKeywords(workBook: any) {
    const sheet = workBook.Sheets[workBook.SheetNames[0]];
    const keywords = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
    });

    return keywords.slice(1).map((row: any) => {
      const regex = /^[0-9; ]+$/;
      const isStrValid = typeof row[1] === 'string' && regex.test(row[1]);
      let themeIds;

      if (Number.isInteger(row[1])) {
        themeIds = [row[1]];
      } else if (isStrValid) {
        themeIds = row[1]
          .split(';')
          .filter((el: string) => !!el)
          .map((el: string) => parseInt(el));
      } else if (!!row[1]) {
        themeIds = row[1];
      } else {
        themeIds = [];
      }
      return { name: row[0], themeIds };
    });
  }
}
