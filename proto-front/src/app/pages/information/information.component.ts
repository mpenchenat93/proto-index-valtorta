import { Location } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Oeuvre } from 'src/app/interfaces/interface';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { WorkerService } from 'src/app/services/worker.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.css'],
})
export class InformationComponent implements OnDestroy {
  private subscription: Subscription = new Subscription();

  oeuvres: Oeuvre[] = [];

  constructor(
    private workerService: WorkerService,
    private dataManager: DataManagerService,
    private location: Location,
    private router: Router
  ) {}

  async ngOnInit() {
    let oeuvresSave = this.dataManager.oeuvresList;
    if (oeuvresSave?.length) {
      this.oeuvres = oeuvresSave.slice(1);
    } else {
      this.subscription.add(
        this.workerService.messages$.subscribe({
          next: (response) => {
            if (response.label === 'confError') {
              if (response.data) {
                this.dataManager.formattedErr = response.data;
                const pathName = this.location.path();
                if (pathName !== '/home') {
                  this.router.navigate(['/home']);
                }
              }
            }

            if (response.label === 'oeuvres') {
              this.oeuvres = response.data;
            }
          },
        })
      );

      const location = window.location.href;
      this.workerService.loadConf(location);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
