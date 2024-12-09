import { Injectable } from '@angular/core';

import { Oeuvre, Volume } from '../interfaces/interface';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  constructor() {}

  getLowerCaseWithNormalize(str: string): string {
    return str
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '');
  }

  getVolumeListOfOeuvre(
    selectedOeuvre: string,
    oeuvreList: Oeuvre[],
    selectLabel: string
  ): Volume[] {
    if (selectedOeuvre !== 'ALL') {
      let _oeuvre = oeuvreList.find((oeuvre: Oeuvre) => {
        return oeuvre.name === selectedOeuvre;
      });
      let list = _oeuvre ? _oeuvre.volumeList || [] : [];
      return [{ Nom: selectLabel, ID: '' }].concat(list);
    }
    return [];
  }

  scrollToBottom(): void {
    $('html, body').animate({ scrollTop: $(document).height() }, 400);
  }

  scrollToTop(): void {
    $('html, body').animate({ scrollTop: 0 }, 400);
  }

  slowScrollToTop(): void {
    $('html, body').animate({ scrollTop: 0 }, 650);
  }

  divListScrollTop() {
    const divListe = document.querySelector('#divListe');
    if (divListe) divListe.scrollTop = 0;
  }

  removeAccents(str: string) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getLang(settings: any) {
    if (settings) {
      if (settings['LANGUE'] === '') {
        return 'fr';
      }
      return settings['LANGUE'];
    }
    return 'fr';
  }

  getLangVersion(settings: any) {
    if (settings) {
      if (settings['LANGUE-VERSION'] === '') {
        return '1';
      }
      return settings['LANGUE-VERSION'];
    }
    return '1';
  }
}
