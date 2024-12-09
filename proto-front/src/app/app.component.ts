import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, firstValueFrom } from 'rxjs';

import { DataManagerService } from './services/data-manager.service';
import { UtilsService } from './services/utils.service';
import { WorkerService } from './services/worker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  private subscription: Subscription = new Subscription();
  private settings: any;

  settingsOk = false;

  constructor(
    private workerService: WorkerService,
    private translate: TranslateService,
    private titleService: Title,
    private dataManager: DataManagerService,
    private utils: UtilsService,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.dataManager.settings) {
      this.settings = this.dataManager.settings;
      this.onSettingsOk();
    } else {
      this.subscription.add(
        this.workerService.messages$.subscribe({
          next: (response) => {
            if (response.label === 'settingsError') {
              this.dataManager.formattedErr = response.data;
              this.translate.setDefaultLang(`fr-1`);

              const pathName = this.location.path();
              if (pathName !== '/home') {
                this.router.navigate(['/home']);
              }
              this.onSettingsOk();
              return;
            }

            if (response.label === 'settings') {
              this.onSettingsReceive(response.data);
            }
          },
        })
      );

      const location = window.location.href;
      this.workerService.loadSettings(location);
    }
  }

  private async onSettingsReceive(data: any) {
    this.dataManager.settings = data.settings || {};
    this.settings = data.settings;
    this.onSettingsOk();
  }

  private async onSettingsOk() {
    this.settingsOk = true;

    let tabLabel = '';
    if (this.settings) {
      const lang = this.utils.getLang(this.settings);
      const langVersion = this.utils.getLangVersion(this.settings);
      this.translate.setDefaultLang(`${lang}-${langVersion}`);

      tabLabel = this.settings['LABEL-TAB'] || null;
    }

    const title = await firstValueFrom(this.translate.get('TAB_NAME'));
    this.titleService.setTitle(tabLabel || title);
  }
}
