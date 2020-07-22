import { Bonus } from './bonus';

export class Player {
    constructor(public value: number, public quot: number,
        public contractType: string, public contractLength: string,
        public bonusList?: Array<Bonus>, public repaid?: string, public repaidValue?: number, public finalQuot?:number, 
        public finalValue?:number, public id?: number) {

    }
}