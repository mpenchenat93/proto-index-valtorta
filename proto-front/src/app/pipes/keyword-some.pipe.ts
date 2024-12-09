import { Pipe, PipeTransform } from '@angular/core';
import { UtilsService } from '../services/utils.service';

@Pipe({
  name: 'keywordSome',
  standalone: true,
})
export class KeywordSomePipe implements PipeTransform {
  constructor(private utils: UtilsService) {}

  transform(keywords: any[], searchKeyword: string): boolean {
    if (!Array.isArray(keywords)) return false;

    return keywords.some((key: any) => {
      let a = this.utils.getLowerCaseWithNormalize(key.value);
      let b = this.utils.getLowerCaseWithNormalize(searchKeyword);
      return a.includes(b);
    });
  }
}
