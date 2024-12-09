import { Component, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { Subscription, firstValueFrom } from 'rxjs';
import { EventService } from 'src/app/services/event.service';

import Mark from 'mark.js';
import { Reference } from 'src/app/interfaces/interface';

import { CommunicationService } from 'src/app/services/communication.service';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'reference-list',
  templateUrl: './reference-list.component.html',
  styleUrls: ['./reference-list.component.css'],
})
export class ReferenceListComponent implements OnDestroy {
  @Input() references?: Reference[];
  @Input() search: string;

  fontSize = 17;
  lineHeight = 1.4;

  // ---

  private detailLabel: string;
  private citationLabel: string;

  // ---

  private previousPage: number;
  private openEvent = false;
  private applyFilterCalled = false;

  // ---

  private _subscriptions = new Subscription();

  ngOnDestroy() {
    this._subscriptions.unsubscribe();
  }

  constructor(
    private eventService: EventService,
    private cookieService: CookieService,
    private translate: TranslateService,
    private communicationService: CommunicationService,
    private dataManager: DataManagerService,
    private utils: UtilsService
  ) {
    this._subscriptions.add(
      this.communicationService.communication$.subscribe(() => {
        this.applyFilterCalled = true;
      })
    );
  }

  async ngOnInit() {
    const settings = this.dataManager.settings;
    const lang = this.utils.getLang(settings);
    const langVersion = this.utils.getLangVersion(settings);
    this.translate.setDefaultLang(`${lang}-${langVersion}`);

    this.detailLabel = await firstValueFrom(this.translate.get('LIST.DETAIL'));
    this.citationLabel = await firstValueFrom(
      this.translate.get('LIST.CITATION')
    );

    this.eventService.dataUpdated$.subscribe((data) => {
      const res = JSON.parse(data);
      if (res.dataType === 'fontSize') {
        this.fontSize = Number(res.newData);
        this.setDynamicFontSize();
      } else {
        this.lineHeight = Number(res.newData);
        this.setDynamicLineHeight();
      }
    });

    let isFontSizeCookieExists = this.cookieService.get('fontSize') !== '';
    if (isFontSizeCookieExists) {
      this.fontSize = parseInt(this.cookieService.get('fontSize'));
      this.setDynamicFontSize();
    }

    const isLineHeightCookieExists =
      this.cookieService.get('lineHeight') !== '';
    if (isLineHeightCookieExists) {
      this.lineHeight = Number(this.cookieService.get('lineHeight'));
      this.setDynamicLineHeight();
    }
  }

  ngAfterViewChecked() {
    if (this.openEvent || this.applyFilterCalled) {
      this.applyMark();
      if (this.openEvent) this.openEvent = false;
      if (this.applyFilterCalled) this.applyFilterCalled = false;
    }
  }

  openNote(ref: Reference) {
    ref.collapsed = false;
    this.openEvent = true;
  }

  closeNote(ref: Reference, index: number) {
    ref.collapsed = true;
    this.openEvent = true;

    setTimeout(() => {
      const element = document.getElementById('reftoscroll' + index);
      element?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }

  getHtmlDetailAndQuote(ref: Reference) {
    let html = '';
    let detailLength = ref.detail ? ref.detail.length : 0;

    if (ref.detail) {
      let truncatedDetail = this.truncateText(ref.detail, ref.collapsed);
      let detail = `<p class="dynamic-content"><u>${this.detailLabel} :</u>&nbsp;<span class="underline">${truncatedDetail}</span></p>`;
      html += detail;
    }

    if (!ref.collapsed || (detailLength < 1500 && ref.quote)) {
      let truncatedQuote = this.truncateText(
        ref.quote,
        ref.collapsed,
        1500 - detailLength
      );
      let quote = `<p class="dynamic-content"><u>${this.citationLabel} :</u>&nbsp;<span class="underline">${truncatedQuote}</span></p>`;
      html += quote;
    }

    return html;
  }

  getTitle(ref: Reference): string {
    let str = ref.oeuvreName;
    str += ref.useVolumes ? `, ${ref.volumeName}` : '';
    str += `, ${ref.referenceLabelAbr} ${ref.reference}`;
    return str;
  }

  lengthDetailAndQuoteRef(ref: Reference) {
    let length = 0;
    if (ref && ref.detail) length += ref.detail.length;
    if (ref && ref.quote) length += ref.quote.length;
    return length;
  }

  // ---

  private applyMark() {
    const context = document.querySelectorAll(
      '.underline'
    ) as NodeListOf<HTMLElement>;
    if (context) {
      const instance = new Mark(context);
      instance.unmark({
        done: () => {
          const trim = this.search.trim();
          instance.mark(trim, {
            separateWordSearch: false,
            acrossElements: true,
          });
        },
      });
    }
  }

  private truncateText(
    text: string,
    isCollapsed: boolean = true,
    maxLength: number = 1500
  ): string {
    if (!isCollapsed || !text) return text;

    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
  }

  private setDynamicFontSize() {
    document.documentElement.style.setProperty(
      '--dynamic-font-size',
      `${this.fontSize}px`
    );
  }

  private setDynamicLineHeight() {
    document.documentElement.style.setProperty(
      '--dynamic-line-height',
      `${this.lineHeight}`
    );
  }
}
