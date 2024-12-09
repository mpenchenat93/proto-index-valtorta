import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addBr',
  standalone: true,
})
export class AddBrPipe implements PipeTransform {
  transform(value: string): string {
    if (this.hasBr(value)) {
      return '<br/>' + value;
    }
    return value;
  }

  private hasBr(str: string): boolean {
    return str.length > 75 || str.includes('<br />');
  }
}
