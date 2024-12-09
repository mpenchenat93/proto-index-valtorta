import { Oeuvre, Reference, ReferenceMin } from 'src/app/interfaces/interface';

export default class FilterService {
  static filterByRefOeuvreAndVolume(
    references: Reference[],
    oeuvre: Oeuvre,
    volume: string,
    reference: string
  ): ReferenceMin[] {
    return references
      .filter((el: Reference) => {
        // Filtre par oeuvre si nécessaire
        if (oeuvre.name !== 'ALL' && el.oeuvreId !== oeuvre.id) {
          return false;
        }

        // Filtre par volume si nécessaire
        if (volume !== '' && el.volume !== volume) {
          return false;
        }

        // Filtre par référence si nécessaire
        if (reference && !el.reference.toString().includes(reference.trim())) {
          return false;
        }

        return true;
      })
      .map((ref) => {
        return { id: ref.id, keywords: ref.keywords };
      });
  }

  static applyFilterByKeywords(
    references: ReferenceMin[],
    selectedKeywords: string[],
    isExclusive: boolean
  ): ReferenceMin[] {
    if (selectedKeywords.length > 0) {
      return references.filter((el: ReferenceMin) => {
        return areKeywordsMatchExclusiveOrInclusive(
          selectedKeywords,
          el.keywords,
          isExclusive
        );
      });
    }
    return references;
  }

  static filterGlobalSearch(references: Reference[], search: string) {
    if (search) {
      const _searchLC = getLowerCaseWithNormalize(search);
      references = references.filter((el: Reference) => {
        return (
          (el.keywordsHidden &&
            el.keywordsHidden.join(', ').includes(_searchLC)) ||
          (el.detailHidden && el.detailHidden.includes(_searchLC)) ||
          (el.quoteHidden && el.quoteHidden.includes(_searchLC))
        );
      });
    }

    return references;
  }
}

// Private methods

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

function getLowerCaseWithNormalize(item: string): string {
  return item
    .trim() // Remove space begin and end
    .toLowerCase()
    .normalize('NFD') // Remove accents
    .replace(/\p{Diacritic}/gu, ''); // Remove accents
}
