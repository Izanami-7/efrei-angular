import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pricePerDay',
  standalone: true
})
export class PricePerDayPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: string = '€'): string {
    if (value === null || value === undefined) {
      return '';
    }
    return `${value} ${currency} / day`;
  }
}
