import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'contractTypeMap'
})
export class ContractTypeMapPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    if(value === 'def' ){
      return 'D'
    } else if(value === 'lend'){
      return 'P'
    } else if( value === "lendO"){
      return 'P (O)'
    } else {
      return 'P (D)'
    }
  }

}
