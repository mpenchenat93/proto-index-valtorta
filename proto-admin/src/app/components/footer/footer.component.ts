import { Component } from '@angular/core';
import { GenericService } from '../../services/generic.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  constructor(private generic: GenericService) {}

  copyrightName = this.generic.copyrightName;
}
