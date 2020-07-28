import { Pipe, PipeTransform } from '@angular/core';
import { Bonus } from '../model/bonus';

@Pipe({
  name: 'bonusCompute'
})
export class BonusComputePipe implements PipeTransform {

  transform(value: Bonus[], ...args: unknown[]): number {
    let totalBonus = 0
    value.forEach(
      bonus => {
        totalBonus += bonus.events * bonus.reward
      }
    )
    return totalBonus
  }

}
