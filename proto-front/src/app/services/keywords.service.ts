import { Injectable } from '@angular/core';

import { SelectableKeyword } from '../interfaces/interface';

@Injectable({
  providedIn: 'root',
})
export class KeywordsService {
  constructor() {}

  getKeywords(
    globalKeywords: SelectableKeyword[],
    selectedThemeKeywords: string[]
  ) {
    if (selectedThemeKeywords?.length) {
      const _selectableThemeKeywords = selectedThemeKeywords.map(
        (kw: any, index: number) => {
          return { value: kw, selected: false, index };
        }
      );

      return _selectableThemeKeywords.filter((kw: SelectableKeyword) => {
        return globalKeywords.find((keyword: SelectableKeyword) => {
          return keyword.value === kw.value;
        });
      });
    } else {
      return globalKeywords;
    }
  }
}
