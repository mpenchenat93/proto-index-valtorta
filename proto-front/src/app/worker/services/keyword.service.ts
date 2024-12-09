import {
  Reference,
  ReferenceMin,
  SelectableKeyword,
} from '../../interfaces/interface';

export default class KeywordService {
  static get(references: Reference[] | ReferenceMin[]): SelectableKeyword[] {
    const arr2 = this.extractAllKeywords(references);
    return arr2.map((el, index) => {
      return { value: el, selected: false, index };
    });
  }

  static extractAllKeywords(
    references: Reference[] | ReferenceMin[]
  ): string[] {
    let arr: string[] = references
      .map((ref: Reference | ReferenceMin) => ref.keywords)
      .flat()
      .sort((a: string, b: string) => {
        return a.localeCompare(b);
      });

    return [...new Set(arr)];
  }
}
