import { Component } from '@angular/core';

import { GenericService } from 'src/app/services/generic.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css'],
})
export class ChartComponent {
  isValtorta = false;

  constructor(private genericService: GenericService) {}

  ngOnInit() {
    this.isValtorta = this.genericService.hasValtortaLogo;
  }
}
