import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { SelectableKeyword } from 'src/app/interfaces/interface';

import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'multi-select-mobile',
  templateUrl: './multi-select-mobile.component.html',
  styleUrl: './multi-select-mobile.component.css',
})
export class MultiSelectMobileComponent {
  @Input() keywords: SelectableKeyword[] = [];
  @Input() selectedKeywords: string[];
  @Input() isOr: boolean;
  @Input() set resetSearchKeyword(value: number) {
    if (value) {
      this.searchKeyword = '';
      this.unSelectAllKeywords();
    }
  }

  @Output() selectedKeywordsChange = new EventEmitter<string[]>();

  searchKeyword = '';

  constructor(private utils: UtilsService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOr'] && !this.isOr) {
      this.searchKeyword = '';
    }
  }

  divListScrollTop = this.utils.divListScrollTop;

  selectKeyword(key: any) {
    const that = this;
    setTimeout(function () {
      key.selected = !key.selected;
      if (key.selected) that.addKeyword(key.value);
      else that.removeKeyword(key.value);
    });
  }

  removeKeyword(keyword: string) {
    this.selectedKeywords = this.selectedKeywords.filter((key) => {
      return key !== keyword;
    });

    for (let i = 0; i < this.keywords.length; i++) {
      const key = this.keywords[i];
      if (key.value === keyword) key.selected = false;
    }

    this.selectedKeywordsChange.emit(this.selectedKeywords);
  }

  // --- Private

  private addKeyword(keyword: string) {
    if (!this.isOr) this.searchKeyword = '';

    this.selectedKeywords = [...this.selectedKeywords, keyword];

    for (let i = 0; i < this.keywords.length; i++) {
      const key = this.keywords[i];
      if (key.value === keyword) key.selected = true;
    }

    this.selectedKeywordsChange.emit(this.selectedKeywords);
  }

  private unSelectAllKeywords() {
    for (let i = 0; i < this.keywords.length; i++) {
      this.keywords[i].selected = false;
    }
    this.selectedKeywords = [];
  }
}
