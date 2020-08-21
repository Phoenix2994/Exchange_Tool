import { Injectable } from '@angular/core';
import { Player } from '../model/player';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  firstTeam: Array<Player> = []
  secondTeam: Array<Player> = []

  finalFirstTeam: Array<Player> = []
  finalSecondTeam: Array<Player> = []

  bonusFirstTeam = []
  bonusSecondTeam = []

  firstTeamValue = 0
  secondTeamValue = 0

  $extra1: Subject<number>
  $extra2: Subject<number>

  extra1: number = 0
  extra2: number = 0

  globalId = 0

  constructor() {
    this.$extra1 = new Subject<number>()
    this.$extra2 = new Subject<number>()

    this.$extra1.subscribe(
      value => this.extra1 = value
    )
    this.$extra2.subscribe(
      value => this.extra2 = value
    )
  }

  save(id: number, player: Player) {
    this.globalId += 1
    player.id = this.globalId

    if (id == 1) {
      this.firstTeam.push(player)
    } else {
      this.secondTeam.push(player)
    }
  }

  computeFinalValues() {
    this.finalFirstTeam = []
    this.finalSecondTeam = []
    this.bonusFirstTeam = []
    this.bonusSecondTeam = []
    this.firstTeamValue = +this.extra1
    this.secondTeamValue = +this.extra2
    //this.computeBonus()
    // check if there is a player lending with right to buy
    if (this.checkIfRightLend()) {
      //compute values for teams
      this.firstTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot
            this.finalFirstTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value, player.id))
          } else if (player.contractType === 'lendO') {
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot
            this.secondTeamValue += +player.repaidValue
            this.finalFirstTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot,
              player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value, player.id))
          }
          else if ((player.contractType === 'lendR' && player.repaid === 'yes')) {
          
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot 
            this.secondTeamValue += +player.repaidValue

            this.finalFirstTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot,
              player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value, player.id))

          } else {
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot * (+player.contractLength / 12) * 0.8
            this.finalFirstTeam.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, player.finalQuot, +player.value * (+player.contractLength / 12) * 0.8, player.id))
          }
          if (player.bonusList) {
            let secondTeamValue = this.secondTeamValue
            player.bonusList.forEach(
              bonus => {
                this.secondTeamValue += bonus.events * bonus.reward
              }
            )
            this.bonusFirstTeam.push(this.secondTeamValue - secondTeamValue)

          }
        }
      )
      this.secondTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot
            this.finalSecondTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value, player.id))
          } else if (player.contractType === 'lendO' || (player.contractType === 'lendR' && player.repaid === 'yes')) {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot
            this.firstTeamValue += +player.repaidValue
            this.finalSecondTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot,
              player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value , player.id))
          } else if ((player.contractType === 'lendR' && player.repaid === 'yes')) {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot
            this.firstTeamValue += +player.repaidValue

            this.finalSecondTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot,
              player.contractType, player.contractLength, null, null,
              null, player.finalQuot, +player.value , player.id))

          } else {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot * (+player.contractLength / 12) * 0.8
            this.finalSecondTeam.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, player.finalQuot, +player.value  * (+player.contractLength / 12) * 0.8, player.id))
          }
          if (player.bonusList) {
            let firstTeamValue = this.firstTeamValue
            player.bonusList.forEach(
              bonus => {
                this.firstTeamValue += bonus.events * bonus.reward
              }
            )
            this.bonusSecondTeam.push(this.firstTeamValue - firstTeamValue)
          }
        }
      )

      // compute bonus for teams
      let bonus1 = this.bonusFirstTeam.reduce((a, b) => a + b, 0)
      let bonus2 = this.bonusSecondTeam.reduce((a, b) => a + b, 0)
      console.log(this.firstTeamValue - this.secondTeamValue)

      //only the smallest valued team will be fixed by addRightValueProportionally
      if (this.firstTeamValue > this.secondTeamValue) {
        let finalSecondTeam = this.addRightValueProportionally(this.firstTeamValue - this.secondTeamValue, bonus1 - bonus2, this.finalSecondTeam, this.bonusSecondTeam)

        this.finalSecondTeam = []
        this.finalFirstTeam = []
        this.firstTeam.forEach(
          player => {
            this.finalFirstTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid,
              player.repaidValue, player.finalQuot, +player.value / +player.quot * +player.finalQuot, player.id))
          }
        )
        finalSecondTeam.forEach(
          value => {
            this.finalSecondTeam.push(value)
          }
        )
      } else if (this.firstTeamValue < this.secondTeamValue) {
        let finalFirstTeam = this.addRightValueProportionally(this.secondTeamValue - this.firstTeamValue, bonus2 - bonus1, this.finalFirstTeam, this.bonusFirstTeam)
        this.finalFirstTeam = []
        this.finalSecondTeam = []
        this.secondTeam.forEach(
          player => {
            this.finalSecondTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid,
              player.repaidValue, player.finalQuot, +player.value / +player.quot * +player.finalQuot, player.id))
          }
        )
        finalFirstTeam.forEach(
          value => {
            this.finalFirstTeam.push(value)
          }
        )
      } else {
        this.finalFirstTeam = []
        this.finalSecondTeam = []
        this.firstTeam.forEach(
          player => {
            this.finalFirstTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid,
              player.repaidValue, player.finalQuot, +player.value / +player.quot * +player.finalQuot, player.id))
          }
        )
        this.secondTeam.forEach(
          player => {
            this.finalSecondTeam.push(new Player(+player.value / +player.quot * +player.finalQuot, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid,
              player.repaidValue, player.finalQuot, +player.value / +player.quot * +player.finalQuot, player.id))
            this.finalSecondTeam.push(player)
          }
        )
      }

    } else {
      //compute values for teams
      this.firstTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.firstTeamValue += +player.value
            this.finalFirstTeam.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else if (player.contractType === 'lendO') {
            this.firstTeamValue += +player.value
            this.secondTeamValue += +player.repaidValue
            this.finalFirstTeam.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else {
            this.firstTeamValue += +player.value * (+player.contractLength / 12) * 0.8
            this.finalFirstTeam.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, null, player.id))
          }
          if (player.bonusList) {
            let secondTeamValue = this.secondTeamValue
            player.bonusList.forEach(
              bonus => {
                this.secondTeamValue += bonus.events * bonus.reward
              }
            )
            this.bonusFirstTeam.push(this.secondTeamValue - secondTeamValue)

          }
        }
      )
      this.secondTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.secondTeamValue += +player.value
            this.finalSecondTeam.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else if (player.contractType === 'lendO') {
            this.secondTeamValue += +player.value
            this.firstTeamValue += +player.repaidValue
            this.finalSecondTeam.push(new Player(+player.repaidValue, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else {
            this.secondTeamValue += +player.value * (+player.contractLength / 12) * 0.8
            this.finalSecondTeam.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, null, player.id))
          }
          if (player.bonusList) {
            let firstTeamValue = this.firstTeamValue
            player.bonusList.forEach(
              bonus => {
                this.firstTeamValue += bonus.events * bonus.reward
              }
            )
            this.bonusSecondTeam.push(this.firstTeamValue - firstTeamValue)
          }
        }
      )

      // compute bonus for teams
      console.log(this.firstTeamValue - this.secondTeamValue)

      let bonus1 = this.bonusFirstTeam.reduce((a, b) => a + b, 0)
      let bonus2 = this.bonusSecondTeam.reduce((a, b) => a + b, 0)


      //only the smallest valued team will be fixed by addValueProportionally
      if (this.firstTeamValue > this.secondTeamValue) {
        let finalSecondTeam = this.addValueProportionally(this.firstTeamValue - this.secondTeamValue, bonus1 - bonus2, this.finalSecondTeam, this.bonusSecondTeam)
        this.finalSecondTeam = []
        this.finalFirstTeam = []
        this.firstTeam.forEach(
          value => this.finalFirstTeam.push(value)
        )
        finalSecondTeam.forEach(
          value => {
            this.finalSecondTeam.push(value)
          }
        )
      } else if (this.firstTeamValue < this.secondTeamValue) {
        let finalFirstTeam = this.addValueProportionally(this.secondTeamValue - this.firstTeamValue, bonus2 - bonus1, this.finalFirstTeam, this.bonusFirstTeam)
        this.finalFirstTeam = []
        this.finalSecondTeam = []
        this.secondTeam.forEach(
          value => this.finalSecondTeam.push(value)
        )
        finalFirstTeam.forEach(
          value => {
            this.finalFirstTeam.push(value)
          }
        )
      } else {
        this.finalFirstTeam = []
        this.finalSecondTeam = []
        this.firstTeam.forEach(
          player => {
            this.finalFirstTeam.push(player)
          }
        )
        this.secondTeam.forEach(
          player => {
            this.finalSecondTeam.push(player)
          }
        )
      }
    }
  }

  computeBonus(bonus: number, teamNumber: number){
    this.firstTeam.forEach(
      player => {
        if (player.bonusList) {
          let playerBonus = 0
          player.bonusList.forEach(
            bonus => {
              playerBonus += bonus.events * bonus.reward
            }
          )
          this.bonusFirstTeam.push(playerBonus)

        }
      }
    )
    this.secondTeam.forEach(
      player => {
        if (player.bonusList) {
          let playerBonus = 0
          player.bonusList.forEach(
            bonus => {
              playerBonus += bonus.events * bonus.reward
            }
          )
          this.bonusSecondTeam.push(playerBonus)

        }
      }
    )
    let bonus1 = this.bonusFirstTeam.reduce((a, b) => a + b, 0)
    let bonus2 = this.bonusSecondTeam.reduce((a, b) => a + b, 0)
  }

  addValueProportionally(value: number, diffBonus: number, values: Player[], bonus: number[]) {
    //compute sum player values and bonus payed for these players
    let sum = values.reduce((a, b) => a + b.value, 0)
    let sumBonus = bonus.reduce((a, b) => a + b, 0)

    /*1)if difference from bonus is smaller than zero the smallest valued team has
    produced smaller bonus:

     Is this difference bigger or smaller than the total value difference between teams?

     a) Bigger: the difference is valued as bonus with value = 0
     b) Smaller: the difference is valued as not bonus and diffBonus has the same value

     2) if difference is bigger the bonus is not valued 
    */
    if (diffBonus < 0) {
      let diff = 0
      diff = value + diffBonus
      if (diff < 0) {
        diffBonus = -value
        value = 0
      } else {
        value = diff
      }
    } else {
      diffBonus = 0
      sumBonus = 1
    }
    let newValues = []
    values.forEach(
      (player, index) => {
        if (player.contractType == "lend" || player.repaid == "no") {
          newValues.push(new Player((player.value + player.value / sum * value + bonus[index] / sumBonus * (diffBonus * -1)) * (12 / +player.contractLength) / 0.8, player.quot, player.contractType, player.contractLength,
            null, null, null, null, null, player.id))
        } else {
          newValues.push(new Player(player.value + player.value / sum * value + bonus[index] / sumBonus * (diffBonus * -1), player.quot, player.contractType, player.contractLength,
            null, null, null, null, null, player.id))
        }
      }
    )
    return newValues
  }

  addRightValueProportionally(value: number, diffBonus: number, values: Player[], bonus: number[]) {
    let sum = values.reduce((a, b) => a + b.finalValue, 0)
    let sumBonus = bonus.reduce((a, b) => a + b, 0)

    if (diffBonus < 0) {
      let diff = 0
      diff = value + diffBonus
      if (diff < 0) {
        diffBonus = -value
        value = 0
      } else {
        value = diff
      }
    } else {
      diffBonus = 0
      sumBonus = 1
    }
    let newValues = []
    values.forEach(
      (player, index) => {
        if (player.contractType == "lend" || player.repaid == "no") {
          newValues.push(new Player((((player.finalValue / +player.quot *
            +player.finalQuot < player.value + player.finalValue / +player.quot *
            +player.finalQuot / sum * value + bonus[index] / sumBonus * (diffBonus * -1)) ?
            (player.value + player.finalValue / +player.quot *
              +player.finalQuot / sum * value + bonus[index] / sumBonus * (diffBonus * -1))
            : player.finalValue / +player.quot *
            +player.finalQuot) * (12 / +player.contractLength) / 0.8) , player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
        } else {
          newValues.push(new Player(((player.finalValue / +player.quot *
            +player.finalQuot < player.value + player.finalValue / +player.quot *
            +player.finalQuot / sum * value + bonus[index] / sumBonus * (diffBonus * -1)) ?
            player.value + player.finalValue / +player.quot *
            +player.finalQuot / sum * value + bonus[index] / sumBonus * (diffBonus * -1) :
            player.finalValue / +player.quot *
            +player.finalQuot) , player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
        }
      }
    )
    return newValues
  }

  checkIfRightLend(): boolean {
    let right = false
    this.firstTeam.forEach(
      player => {
        if (player.contractType == "lendR" && player.repaid == "yes") {
          right = true
        }
      }
    )
    this.secondTeam.forEach(
      player => {
        if (player.contractType == "lendR" && player.repaid == "yes") {
          right = true
        }
      }
    )
    return right;
  }


  remove(id: number) {
    this.firstTeam = this.firstTeam.filter(val => val.id != id)
    this.secondTeam = this.secondTeam.filter(val => val.id != id)
  }

}
