import { Player } from "./player";

export class Team {
    constructor(public players: Player[], public finalPlayers: Player[],
        public bonusList: number[],
        public value: number, public extra: number, public bonus: number,
        public repaid: number, public finalValue: number,
        public finalValueEval: number, public quot: number, public finalQuot: number) {
    }
}