import { Component, Input } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-form-btn',
  templateUrl: './form-btn.component.html',
  styleUrl: './form-btn.component.css',
})
export class FormBtnComponent {
  @Input() resetAllForm: () => void;
  @Input() toggleFollowAlert: () => void;
  @Input() toggleFollowAlert2: () => void;

  fontSize = 17;
  lineHeight = 1.4;

  showFollowAlert = false;

  constructor(
    private cookieService: CookieService,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const isFontSizeCookieExists = this.cookieService.get('fontSize') !== '';
    if (isFontSizeCookieExists)
      this.fontSize = parseInt(this.cookieService.get('fontSize'));

    const isLineHeightCookieExists =
      this.cookieService.get('lineHeight') !== '';
    if (isLineHeightCookieExists)
      this.lineHeight = Number(this.cookieService.get('lineHeight'));
  }

  openDocs() {
    window.open('/assets/docs/', '_blank');
  }

  lineHeightLess() {
    if (this.lineHeight > 1.3) {
      this.lineHeight = Number((this.lineHeight - 0.1).toFixed(1));
      this.cookieService.set('lineHeight', this.lineHeight.toString(), {
        expires: 400,
      });
      this.eventService.emitDataUpdated(
        'lineHeight',
        this.lineHeight.toString()
      );
    }
  }

  lineHeightMore() {
    if (this.lineHeight < 1.6) {
      this.lineHeight = Number((this.lineHeight + 0.1).toFixed(1));
      this.cookieService.set('lineHeight', this.lineHeight.toString(), {
        expires: 400,
      });
      this.eventService.emitDataUpdated(
        'lineHeight',
        this.lineHeight.toString()
      );
    }
  }

  fontSizeLess() {
    if (this.fontSize > 16) {
      this.fontSize--;
      this.cookieService.set('fontSize', this.fontSize.toString(), {
        expires: 400,
      });
      this.eventService.emitDataUpdated('fontSize', this.fontSize.toString());
    }
  }

  fontSizeMore() {
    if (this.fontSize < 19) {
      this.fontSize++;
      this.cookieService.set('fontSize', this.fontSize.toString(), {
        expires: 400,
      });
      this.eventService.emitDataUpdated('fontSize', this.fontSize.toString());
    }
  }
}
