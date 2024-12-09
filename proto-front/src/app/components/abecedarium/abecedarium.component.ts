import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SelectableKeyword } from 'src/app/interfaces/interface';
import { KeywordSomePipe } from 'src/app/pipes/keyword-some.pipe';
import { KeywordsService } from 'src/app/services/keywords.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-abecedarium',
  templateUrl: './abecedarium.component.html',
  styleUrl: './abecedarium.component.css',
})
export class AbecedariumComponent {
  @Input() keywords: SelectableKeyword[];
  @Input() selectedKeywords: string[];
  @Input() isOr: boolean;
  @Input() selectedThemeKeywords: string[];
  @Input() set resetSearchKeyword(value: number) {
    if (value) {
      this.globalSearch = '';
      this.letterSearch = '';
      this.unSelectAllKeywords();
      this.currentLetter = 'A';

      if (!this.isOr) {
        this.computeDisabled();
      }
    }
  }

  @Output() selectedKeywordsChange: EventEmitter<string[]> = new EventEmitter();

  currentLetter = 'A';
  globalSearch = '';
  letterSearch = '';

  alphabet: string[] = [];

  private globalKeywords: SelectableKeyword[] = [];
  private isDisabledList: any[] = [];
  private keywordsByGroup: any = [];

  private keywordSomePipe: KeywordSomePipe;

  constructor(
    private utilsService: UtilsService,
    private keywordService: KeywordsService
  ) {
    this.keywordSomePipe = new KeywordSomePipe(this.utilsService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['keywords']) {
      this.globalKeywords = this.keywords;
      this.keywords = this.keywordService.getKeywords(
        this.globalKeywords,
        this.selectedThemeKeywords
      );

      this.applySelection();
      this.reload();
      this.computeDisabled();
      return;
    }

    if (changes['selectedThemeKeywords'] && this.keywords?.length) {
      this.keywords = this.keywordService.getKeywords(
        this.globalKeywords,
        this.selectedThemeKeywords
      );

      this.applySelection();
      this.reload();
      this.computeDisabled();
    }

    if (changes['isOr']) {
      if (!this.isOr) {
        this.globalSearch = '';
        this.letterSearch = '';
      }
      this.reload();
      this.computeDisabled();
    }
  }

  // ---

  // MAJ isDisabledList + currentLetter
  computeDisabled() {
    // reset list
    this.isDisabledList = this.alphabet.map((letter) => {
      return { letter, disabled: false };
    });

    // re-apply
    this.alphabet.forEach((letter) => {
      let list = this.getKeyworksListByLetter(letter);
      if (list.length === 0) {
        this.setDisabledStatusByLetter(letter, true);
      }

      this.setDisabledStatusByLetter(
        letter,
        !this.keywordSomePipe.transform(list, this.globalSearch)
      );
    });

    const isCurrentLetterAvailable = !this.isLetterDisabled(this.currentLetter);
    if (!isCurrentLetterAvailable) {
      const _letter = this.alphabet.find(
        (letter: string) => !this.isLetterDisabled(letter)
      );
      this.currentLetter = _letter || 'A';
    }
  }

  isLetterDisabled(letter: string): boolean {
    return this.isDisabledList.find((el) => el.letter === letter)?.disabled;
  }

  getKeyworksListByLetter(letter: string) {
    return this.keywordsByGroup.find((kwG: any) => {
      return kwG.letter === letter;
    })?.list;
  }

  selectLetter(letter: string) {
    this.currentLetter = letter;
  }

  removeKeyword(keyword: string) {
    if (!this.isOr) {
      this.globalSearch = '';
      this.letterSearch = '';
    }

    this.selectedKeywords = this.selectedKeywords.filter((key: any) => {
      return key !== keyword;
    });
    this.selectedKeywordsChange.emit(this.selectedKeywords);

    for (let i = 0; i < this.keywords.length; i++) {
      const key = this.keywords[i];
      if (key.value === keyword) key.selected = false;
    }

    for (let i = 0; i < this.keywordsByGroup.length; i++) {
      const arr = this.keywordsByGroup[i].list;
      for (let j = 0; j < arr.length; j++) {
        if (arr[j].value === keyword) arr[j].selected = false;
      }
    }

    if (!this.isOr) {
      this.reload();
      this.computeDisabled();
    }
  }

  selectKeyword(key: any) {
    key.selected = !key.selected;

    if (key.selected) this.addKeyword(key.value);
    else this.removeKeyword(key.value);
  }

  // Private methods

  /**
   * currentLetter --> A
   * Set alphabet [A - Z; #]
   * Compute keywordsByGroup
   */
  private reload() {
    this.currentLetter = 'A';
    this.alphabet = [...Array(26)]
      .map((_, i) => String.fromCharCode(i + 65))
      .concat('#');

    this.keywordsByGroup = [];
    this.alphabet.forEach((letter) => {
      const tt = this.keywords.filter((kw) => {
        return (
          this.utilsService.removeAccents(kw.value[0].toUpperCase()) === letter
        );
      });
      if (letter !== '#') this.keywordsByGroup.push({ list: tt, letter });
    });

    // list of index
    let indexes: any = [];
    for (let i = 0; i < this.keywordsByGroup.length; i++) {
      const arr = this.keywordsByGroup[i].list;
      for (let j = 0; j < arr.length; j++) {
        indexes.push(arr[j].index);
      }
    }

    // Récupérer la liste des mots-clés non utilisés
    let notUsedKw: any = [];
    this.keywords.forEach((kw) => {
      if (!indexes.includes(kw.index)) {
        notUsedKw.push(kw);
      }
    });

    this.keywordsByGroup.push({ letter: '#', list: notUsedKw });
  }

  private unSelectAllKeywords() {
    for (let i = 0; i < this.keywordsByGroup.length; i++) {
      const arr = this.keywordsByGroup[i];
      for (let j = 0; j < arr.list.length; j++) {
        arr.list[j].selected = false;
      }
    }
    this.selectedKeywords = [];
  }

  private addKeyword(keyword: string) {
    if (!this.isOr) {
      this.globalSearch = '';
      this.letterSearch = '';
    }

    this.selectedKeywords.push(keyword);
    this.selectedKeywordsChange.emit(this.selectedKeywords);

    if (!this.isOr) {
      this.reload();
      this.computeDisabled();
    }
  }

  private setDisabledStatusByLetter(letter: string, status: boolean) {
    for (let i = 0; i < this.isDisabledList.length; i++) {
      const el = this.isDisabledList[i];
      if (letter === el.letter) el.disabled = status;
    }
  }

  private applySelection() {
    // Apply selection on keywords
    for (let i = 0; i < this.keywords.length; i++) {
      const kw = this.keywords[i];
      if (this.selectedKeywords.includes(kw.value)) {
        kw.selected = true;
      }
    }
  }
}
