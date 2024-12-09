import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { TreeNode } from 'primeng/api';

import {
  FilterData,
  Oeuvre,
  Reference,
  SelectableKeyword,
  Volume,
} from 'src/app/interfaces/interface';

import { DataManagerService } from 'src/app/services/data-manager.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WorkerService } from 'src/app/services/worker.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
})
export class FormComponent {
  @ViewChild('mySelect', { static: false }) mySelect: ElementRef;

  @Input() oeuvreList: Oeuvre[];
  @Input() page: number;
  @Input() references: Reference[];
  @Input() keywords: SelectableKeyword[];
  @Input() themeTree: TreeNode[];
  @Input() search: string;
  @Input() isJobDone: boolean;
  @Input() isTreePresent: boolean;

  @Output() searchChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() referencesChange = new EventEmitter<Reference[]>();

  @Output() hierarchyErrorEv: EventEmitter<any> = new EventEmitter();

  volumeList: Volume[];

  resetSearchKeyword = 0;

  isMobile = false;

  // Form
  oeuvre: Oeuvre;
  volume: string = '';
  reference = '';

  selectedKeywords: string[] = [];
  selectedThemeKeywords: string[] = [];

  // Labels
  referenceLabel: string;
  select2Label: string;
  searchLabel: string;
  searchMobileLabel: string;

  // ---

  showFollowAlert = false;
  showFollowAlert2 = false;
  settings: any = {};

  private _orMode = 'inclusive';
  private oeuvreListSetted = false;

  constructor(
    private utils: UtilsService,
    private deviceService: DeviceDetectorService,
    private translate: TranslateService,
    private dataManager: DataManagerService,
    private workerService: WorkerService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  get orMode(): string {
    return this._orMode;
  }

  set orMode(value: string) {
    this._orMode = value;
    this.applyFilter(false, false, true);
  }

  get isOr() {
    return this.orMode === 'inclusive';
  }

  async ngOnInit() {
    this.settings = this.dataManager.settings;
    this.initTranslation(this.settings);

    this.selectedKeywords = [];
  }

  // IHM

  toggleFollowAlert() {
    this.showFollowAlert = !this.showFollowAlert;
    if (this.showFollowAlert) {
      setTimeout(function () {
        const element = document.getElementById('followText');
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.scrollY;
          const middlePoint =
            absoluteElementTop -
            window.innerHeight / 2 +
            elementRect.height / 2;

          window.scrollTo({
            top: middlePoint,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }

  toggleFollowAlert2() {
    this.showFollowAlert2 = !this.showFollowAlert2;
    if (this.showFollowAlert2) {
      setTimeout(function () {
        const element = document.getElementById('followText2');
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.scrollY;
          const middlePoint =
            absoluteElementTop -
            window.innerHeight / 2 +
            elementRect.height / 2;

          window.scrollTo({
            top: middlePoint,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }

  hasVolumeSelect(): boolean {
    if (!this.oeuvre || this.oeuvre.name === 'ALL') return false;
    else if (this.oeuvre) {
      let volumeList: Volume[] = this.utils.getVolumeListOfOeuvre(
        this.oeuvre.name,
        this.oeuvreList,
        this.select2Label
      );
      return volumeList.length > 2; // 2 because of "Toute l'oeuvre"
    }
    return false;
  }

  getSearchPlaceholder(): string {
    return this.isMobile ? this.searchMobileLabel : this.searchLabel;
  }

  getReferencePlaceholder(): string {
    if (this.oeuvre && this.oeuvre.name !== 'ALL') {
      let _oeuvre = this.oeuvreList.find(
        (pOeuvre: Oeuvre) => pOeuvre.name === this.oeuvre.name
      );
      return _oeuvre?.referenceLabel || this.referenceLabel;
    } else {
      return this.referenceLabel;
    }
  }

  // LISTENING EVENTS

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['oeuvreList'] &&
      this.oeuvreList.length &&
      !this.oeuvreListSetted
    ) {
      this.oeuvre = this.oeuvreList[0];
      this.oeuvreListSetted = true;
    }
  }

  onSelectedThemeKeywords(keywords: string[]) {
    this.selectedThemeKeywords = keywords;
    this.applyFilter(false, true);
  }

  onSelectedKeywords(keywords: string[]) {
    this.selectedKeywords = keywords;
    this.applyFilter(false, true);
  }

  onChangeVolume(): void {
    this.divListScrollTop();
    this.applyFilter(true);
  }

  onChangeReference(newValue: string): void {
    this.divListScrollTop();
    this.reference = newValue;
    this.applyFilter(true);
  }

  onChangeSearch(): void {
    this.divListScrollTop();
    this.applyFilter();
    this.searchChange.emit(this.search);
  }

  onChangeOeuvre(): void {
    let _list = this.utils.getVolumeListOfOeuvre(
      this.oeuvre.name,
      this.oeuvreList,
      this.select2Label
    );
    this.volumeList = _list;
    this.volume = '';

    this.divListScrollTop();
    this.applyFilter(true);
  }

  // FORM

  resetAllForm(): void {
    this.oeuvre = this.oeuvreList[0];
    this.volume = '';
    this.reference = '';
    this.search = '';
    this.selectedKeywords = [];
    this.selectedThemeKeywords = [];

    this.divListScrollTop();
    this.workerService.resetFilter();
    this.searchChange.emit(this.search);
    this.resetSearchKeyword++;
  }

  // Private methods

  private divListScrollTop = this.utils.divListScrollTop;

  private initTranslation(settings: any) {
    const lang = this.utils.getLang(settings);
    const langVersion = this.utils.getLangVersion(settings);
    this.translate.setDefaultLang(`${lang}-${langVersion}`);

    this.translate.get('FORM.REF').subscribe((res: string) => {
      this.referenceLabel = res;
    });

    this.translate.get('FORM.SEARCH').subscribe((res: string) => {
      this.searchLabel = res;
    });

    this.translate.get('FORM.SEARCH.MOBILE').subscribe((res: string) => {
      this.searchMobileLabel = res;
    });

    this.translate.get('FORM.SELECT2').subscribe((res: string) => {
      this.select2Label = res;
    });
  }

  private applyFilter(
    oeuvreChange?: boolean,
    keywordChange?: boolean,
    orModeChange?: boolean
  ) {
    const data: FilterData = {
      oeuvre: this.oeuvre,
      reference: this.reference,
      volume: this.volume,
      search: this.search,
      keywords: this.selectedKeywords,
      themeKeywords: this.selectedThemeKeywords,
      isExclusive: !this.isOr,
    };
    this.workerService.applyFilter(
      data,
      oeuvreChange,
      keywordChange,
      orModeChange
    );
  }
}
