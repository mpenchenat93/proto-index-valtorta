import { FormChange, Reference } from 'src/app/interfaces/interface';

import DataManager from './data-manager.service';
import { HierarchyService } from './hierarchy.service';
import KeywordService from './keyword.service';
import MessageService from './message.service';

export default class DataFilterService {
  constructor(private dm: DataManager) {}

  reset() {
    this.dm.PAGE = 1;

    const refs = this.dm.REFERENCES;

    this.dm.REF1 = refs;

    MessageService.postCptRef(refs.length);
    MessageService.postReferences(refs.slice(0, this.dm.PAGESIZE), true);

    // Keywords and Tree
    const kw = KeywordService.get(refs);

    if (this.dm.TREE) {
      const _tree = HierarchyService.buildFinalTree(
        refs,
        this.dm.KEYWORDS_TREE,
        this.dm.THEMES_TREE
      );
      MessageService.postTree(_tree);
    }

    MessageService.postKeywords(kw);
  }

  filter(change: FormChange, data: any): void {
    this.dm.PAGE = 1;

    const oeuvre = data.oeuvre;
    const reference = data.reference;
    const volume = data.volume;
    const search = data.search;
    const selectedKeywords = data.keywords;
    const isExclusive = data.isExclusive;
    const selectedThemeKeywords = data.themeKeywords;

    if (isExclusive && change.keywordChange) {
      let _kw = transform(this.dm.REF1, selectedKeywords).map(
        (kw: any, index: number) => {
          return { value: kw, selected: false, index };
        }
      );

      MessageService.postKeywords(_kw);
    }

    if (!isExclusive && change.orModeChange) {
      const kw = KeywordService.get(this.dm.REF1);
      MessageService.postKeywords(kw);
    }

    let _searchLC = '';
    if (search) _searchLC = getLowerCaseWithNormalize(search);

    let arrOeuvre = [];
    let arr = [];

    for (let i = 0; i < this.dm.REFERENCES.length; i++) {
      const ref = this.dm.REFERENCES[i];

      let matchAll = true;

      // ### OEUVRE BEGIN
      let matchByOeuvre = true;

      // Filtre par oeuvre si nécessaire
      if (oeuvre && oeuvre.name !== 'ALL' && ref.oeuvreId !== oeuvre.id) {
        matchByOeuvre = false;
        matchAll = false;
      }

      // Filtre par volume si nécessaire
      if (matchAll && volume !== '' && ref.volume !== volume) {
        matchByOeuvre = false;
        matchAll = false;
      }

      // Filtre par référence si nécessaire
      if (
        matchAll &&
        reference &&
        !ref.reference.toString().includes(reference.trim())
      ) {
        matchByOeuvre = false;
        matchAll = false;
      }

      if (matchByOeuvre) arrOeuvre.push(ref);

      // ### THEME_KEYWORDS BEGIN
      if (matchAll && selectedThemeKeywords.length > 0) {
        matchAll = areKeywordsMatchExclusiveOrInclusive(
          selectedThemeKeywords,
          ref.keywords,
          false
        );
      }

      // ### KEYWORDS BEGIN
      if (matchAll && selectedKeywords.length > 0) {
        matchAll = areKeywordsMatchExclusiveOrInclusive(
          selectedKeywords,
          ref.keywords,
          isExclusive
        );
      }

      // ### SEARCH BEGIN
      if (matchAll && _searchLC) {
        matchAll = !!(
          (ref.keywordsHidden &&
            ref.keywordsHidden.join(', ').includes(_searchLC)) ||
          (ref.detailHidden && ref.detailHidden.includes(_searchLC)) ||
          (ref.quoteHidden && ref.quoteHidden.includes(_searchLC))
        );
      }

      if (matchAll) arr.push(ref);
    }

    if (change.oeuvreChange) {
      this.dm.REF1 = arrOeuvre;
      const kw = KeywordService.get(arrOeuvre);

      if (this.dm.TREE) {
        const _tree = HierarchyService.buildFinalTree(
          arrOeuvre,
          this.dm.KEYWORDS_TREE,
          this.dm.THEMES_TREE
        );
        MessageService.postTree(_tree);
      }

      MessageService.postKeywords(kw);
    }

    this.dm.FILTERED_REFERENCES = arr;

    MessageService.postCptRef(arr.length);
    MessageService.postReferences(arr.slice(0, this.dm.PAGESIZE), true);
  }
}

function getLowerCaseWithNormalize(item: string): string {
  return item
    .trim() // Remove space begin and end
    .toLowerCase()
    .normalize('NFD') // Remove accents
    .replace(/\p{Diacritic}/gu, ''); // Remove accents
}

function areKeywordsMatchExclusiveOrInclusive(
  selectedKeywords: string[],
  keywordsOfRef: string[],
  isExclusive = false
) {
  if (!isExclusive) {
    return selectedKeywords.some((item: string) => {
      return keywordsOfRef.includes(item);
    });
  } else {
    return selectedKeywords.every((selectedKeyword) =>
      keywordsOfRef.includes(selectedKeyword)
    );
  }
}

function transform(
  references: Reference[],
  selectedKeywords: string[]
): string[] {
  // on garde les mots-clés des références qui match avec les selectedKw
  // filter references that matchs
  let arr = [];
  for (let i = 0; i < references.length; i++) {
    const kws = references[i].keywords;
    if (areAllAInB(selectedKeywords, kws)) {
      arr.push(kws);
    }
  }

  // on retire les doublons
  arr = [...new Set(arr.flat())];
  const arr2: string[] = arr
    // on retire les selectedKw
    .filter((element) => !selectedKeywords.includes(element))
    .map((el: string) => removeHtmlFromString(el))
    .filter((element) => element !== '')
    .sort((a: string, b: string) => {
      return a.localeCompare(b);
    });

  return arr2;
}

function areAllAInB(A: string[], B: string[]) {
  return A.every((element) => B.includes(element));
}

function removeHtmlFromString(str: string): string {
  return str
    .replaceAll('</b>', '')
    .replaceAll('<b>', '')
    .replaceAll('</i>', '')
    .replaceAll('<i>', '')
    .replaceAll('<br />', '');
}
