import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { SelectableKeyword } from 'src/app/interfaces/interface';

import { NgSelectEvent } from 'src/app/interfaces/ng-select-event';
import { KeywordsService } from 'src/app/services/keywords.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-keyword',
  templateUrl: './keyword.component.html',
  styleUrl: './keyword.component.css',
})
export class KeywordComponent {
  @Input() keywords: SelectableKeyword[];
  @Input() selectedThemeKeywords: string[];
  @Input() orMode: string;
  @Input() resetSearchKeyword: number;
  @Input() isJobDone: boolean;

  @Output() selectedKeywordsEv: EventEmitter<string[]> = new EventEmitter();
  @Output() orModeChange: EventEmitter<string> = new EventEmitter();

  filteredKeywords: SelectableKeyword[] = [];
  nbKeywords = 0;

  keywordForm = 'simple';

  isActiveInfoBtn = false;
  isMobile = false;

  input$ = new Subject<string>();

  private previousResetNumber = 0;
  private globalKeywords: SelectableKeyword[];
  private _selectedKeywords: string[] = [];

  constructor(
    private deviceService: DeviceDetectorService,
    private utils: UtilsService,
    private keywordService: KeywordsService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  get isOr() {
    return this.orMode === 'inclusive';
  }

  get selectedKeywords(): any {
    return this._selectedKeywords;
  }

  set selectedKeywords(valeur: any) {
    this.selectedKeywordsEv.emit(valeur);
    this._selectedKeywords = valeur;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isArrayKeywords = Array.isArray(this.keywords);

    if (changes['keywords']) {
      if (isArrayKeywords) {
        this.globalKeywords = this.keywords;
        this.keywords = this.keywordService.getKeywords(
          this.globalKeywords,
          this.selectedThemeKeywords
        );
        this.nbKeywords = this.keywords.length;
        this.filteredKeywords = this.keywords.slice(0, 50);

        if (this.isOr) {
          this.selectedKeywords = this.selectedKeywords.filter((kw: string) => {
            return !!this.keywords.find((_kw) => _kw.value === kw);
          });
        }
      } else {
        this.nbKeywords = 0;
      }
    }

    if (changes['selectedThemeKeywords'] && isArrayKeywords) {
      this.keywords = this.keywordService.getKeywords(
        this.globalKeywords,
        this.selectedThemeKeywords
      );
      this.nbKeywords = this.keywords.length;
      this.filteredKeywords = this.keywords.slice(0, 50);

      if (this.selectedThemeKeywords?.length && this.isOr) {
        this.selectedKeywords = this.selectedKeywords.filter((kw: string) => {
          return !!this.keywords.find((_kw) => _kw.value === kw);
        });
      }
    }

    if (
      changes['resetSearchKeyword'] &&
      this.previousResetNumber !== this.resetSearchKeyword
    ) {
      this.selectedKeywords = [];
      this.onSearch({ term: '', items: [1] });
    }
  }

  onSearch(event: NgSelectEvent) {
    if (event) {
      let term = event.term || '';
      term = this.utils.removeAccents(term.toLowerCase());
      if (term) {
        this.filteredKeywords = this.keywords
          .filter((kw: SelectableKeyword) => {
            let value = this.utils.removeAccents(kw.value.toLowerCase());
            return value.includes(term);
          })
          .slice(0, 50);
      } else {
        this.filteredKeywords = this.keywords.slice(0, 50);
      }
    }
  }

  onOrModeRadioChange() {
    this.orModeChange.emit(this.orMode);
    this.selectedKeywordsEv.emit(this.selectedKeywords);
  }

  onDropDownChange(): void {
    if (this.orMode === 'exclusive') {
      this.onSearch({ term: '', items: [1] });
    }
  }

  onDropDownClose(): void {
    this.onSearch({ term: '', items: [1] });
  }
}
