import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roundPipe'
})
export class RoundPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): number {
    return Math.round(value * 100) / 100
  }

}
