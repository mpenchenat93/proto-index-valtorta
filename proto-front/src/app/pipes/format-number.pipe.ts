import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatNumber',
  standalone: true,
})
export class FormatNumberPipe implements PipeTransform {
  transform(value: any, locale: string = 'fr-FR'): string {
    if (value === null || value === undefined) return value;
    if (isNaN(value)) return value;

    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0, // Limite le nombre de chiffres après la virgule
      minimumFractionDigits: 0, // Minimum de chiffres après la virgule
      useGrouping: true, // Utilise le regroupement de chiffres (ex: espaces pour les milliers)
    }).format(value);
  }
}
