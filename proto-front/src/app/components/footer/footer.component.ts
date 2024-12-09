import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { GenericService } from 'src/app/services/generic.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  constructor(
    private utils: UtilsService,
    private router: Router,
    private generic: GenericService,
    private dataManager: DataManagerService,
    private location: Location
  ) {}

  scrollToTop = this.utils.slowScrollToTop;
  copyrightName = this.generic.copyrightName;
  hasValtortaLogo = this.generic.hasValtortaLogo;

  pathName: string;

  settings: any = {};

  async ngOnInit() {
    this.settings = this.dataManager.settings || {};
    this.pathName = this.location.path();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.pathName = event.url;
      });
  }
}
