import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GenericService } from './services/generic.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  copyrightName = this.generic.copyrightName;

  constructor(
    private translate: TranslateService,
    private generic: GenericService
  ) {}

  ngOnInit() {
    this.translate.setDefaultLang(`fr-1`);
  }
}
