import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'defensive-code',
  templateUrl: './defensive-code.component.html',
  styleUrls: ['./defensive-code.component.css'],
})
export class DefensiveCodeComponent {
  @Input() formattedErr?: any;

  private missingColumnText = '';
  private missingColumnsText = '';

  constructor(private translate: TranslateService) {}

  async ngOnInit() {
    this.missingColumnText = await firstValueFrom(
      this.translate.get('DEF.MISSING-COLUMN')
    );

    this.missingColumnsText = await firstValueFrom(
      this.translate.get('DEF.MISSING-COLUMNS')
    );
  }

  requiredColumnText(arr: string[]) {
    return arr.length > 1 ? this.missingColumnsText : this.missingColumnText;
  }

  arrayToString(arr: string[]): string {
    let output = '';
    for (let i = 0; i < arr.length; i++) {
      if (i === 0) output = `"${arr[i]}"`;
      else if (i > 0 && i == arr.length - 1) output += ` et "${arr[i]}"`;
      else if (i > 0) output += `, "${arr[i]}"`;
    }

    return output;
  }
}
