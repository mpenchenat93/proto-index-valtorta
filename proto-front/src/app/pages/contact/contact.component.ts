import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { DataManagerService } from 'src/app/services/data-manager.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  email = '';
  response = '';

  required = false;
  wrongResponse = false;

  constructor(
    private dataManager: DataManagerService,
    private translate: TranslateService
  ) {}

  urlForm = '';

  validated = false;
  private res = '';

  async ngOnInit() {
    window.scrollTo(0, 0);

    const settings = this.dataManager.settings;

    if (settings) {
      this.email = settings.EMAIL;
      this.urlForm = settings['URL-FORM'] || '';
    }

    this.res = await firstValueFrom(this.translate.get('CONTACT.R'));
  }

  checkResponse() {
    this.required = false;
    this.wrongResponse = false;

    if (this.response === '') this.required = true;
    else if (this.response.toLowerCase().trim() !== this.res.toLowerCase())
      this.wrongResponse = true;
    else this.validated = true;
  }
}
