import { Component, Input } from '@angular/core';
import { FormattedError } from 'src/app/interfaces/interface';
import { DataManagerService } from '../../services/data-manager.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  @Input() hideLinks: boolean;

  // Defensive Code
  formattedErr: FormattedError[] = [];

  titleGen = '';

  constructor(private dataManager: DataManagerService) {}

  ngOnInit() {
    const _formattedErr = this.dataManager.formattedErr;
    if (_formattedErr.length) {
      this.formattedErr = _formattedErr;
      return;
    }

    const settings = this.dataManager.settings;
    this.titleGen = settings ? settings['TITRE'] : '';
  }
}
