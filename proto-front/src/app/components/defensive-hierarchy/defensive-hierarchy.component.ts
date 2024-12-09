import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-defensive-hierarchy',
  templateUrl: './defensive-hierarchy.component.html',
  styleUrl: './defensive-hierarchy.component.css',
})
export class DefensiveHierarchyComponent {
  @Input() hierarchyError: any;

  error = '';

  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    if (this.hierarchyError.code) {
      this.error = await this.getTranslation(
        this.hierarchyError.code,
        this.hierarchyError.data
      );
    }
  }

  async getTranslation(code: string, data: any) {
    switch (code) {
      case 'ARRAY_REQUIRED':
        return await firstValueFrom(this.translate.get('ARRAY_REQUIRED'));

      default:
        return await firstValueFrom(this.translate.get(code, { i: data }));
    }
  }
}
