import { Pipe, PipeTransform } from '@angular/core';
import { SelectableKeyword } from '../interfaces/interface';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'keywordFilter',
  standalone: true,
})
export class KeywordFilterPipe implements PipeTransform {
  constructor(private utils: UtilsService) {}

  transform(
    keywords: SelectableKeyword[],
    searchKeyword: string,
    withSlice = true
  ): SelectableKeyword[] {
    if (!Array.isArray(keywords)) return keywords;

    if (!searchKeyword) {
      return withSlice ? keywords.slice(0, 100) : keywords;
    }

    let arr = keywords.filter((key: SelectableKeyword) => {
      let a = this.utils.getLowerCaseWithNormalize(key.value);
      let b = this.utils.getLowerCaseWithNormalize(searchKeyword);
      return a.includes(b);
    });

    return withSlice ? arr.slice(0, 100) : arr;
  }
}
