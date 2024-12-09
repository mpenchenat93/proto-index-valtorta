import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { Reference } from '../interfaces/interface';
import FormatService from '../worker/services/format.service';
import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private genericService: GenericService,
    private cookieService: CookieService
  ) {}

  async getFile(references: Reference[], tabLabel: string): Promise<any> {
    const fontSize = parseInt(this.cookieService.get('fontSize') || '18') + 1;
    const lineHeight = Number(this.cookieService.get('lineHeight') || '1.4');
    const titleLabel = await firstValueFrom(this.translate.get('TAB_NAME'));
    const detailLabel = await firstValueFrom(this.translate.get('LIST.DETAIL'));
    const keywordsLabel = await firstValueFrom(this.translate.get('KEYWORDS'));
    const quoteLabel = await firstValueFrom(
      this.translate.get('LIST.CITATION')
    );
    let str = '';
    for (let i = 0; i < references.length; i++) {
      str += FormatService.getStringForHtmlExport(
        references[i],
        keywordsLabel,
        detailLabel,
        quoteLabel,
        lineHeight
      );
    }

    const showFooter = this.genericService.hasValtortaLogo;
    let footerSection = '';
    if (showFooter) {
      footerSection = `<p style="padding-bottom: 50px; padding-top: 20px">
                        Notes tirées du site
                        <a href="https://indexvaltorta.fr">indexvaltorta.fr</a>
                      </p>`;
    }

    try {
      const template = await firstValueFrom(
        this.http.get('assets/templates/export.template', {
          responseType: 'text',
        })
      );
      let result = template
        .replace('{{ title }}', tabLabel || titleLabel)
        .replace('{{ content }}', str)
        .replace('{{ fontSize }}', '' + fontSize)
        .replace('{{ footerSection }}', footerSection);

      const blob = new Blob([result], {
        type: 'text/html;charset=UTF-8',
      });
      const fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        window.URL.createObjectURL(blob)
      );

      const trustedUrl = this.sanitizer.sanitize(4, fileUrl);
      if (!trustedUrl) throw new Error('URL sanitization failed');

      const link = document.createElement('a');
      link.href = trustedUrl;
      link.download = 'notes.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error loading template:', err);
      throw err;
    }
  }
}
