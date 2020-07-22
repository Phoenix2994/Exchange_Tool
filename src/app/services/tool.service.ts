import { Injectable } from '@angular/core';
import { Player } from '../model/player';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolService {

  firstTeam: Array<Player> = []
  secondTeam: Array<Player> = []

  finalFirstTeamValues: Array<Player> = []
  finalSecondTeamValues: Array<Player> = []

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
    this.finalFirstTeamValues = []
    this.finalSecondTeamValues = []
    this.firstTeamValue = +this.extra1
    this.secondTeamValue = +this.extra2
    if (this.checkIfRightLend()) {
      this.firstTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot
            this.finalFirstTeamValues.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null,
              null, null, +player.value / +player.quot * +player.finalQuot, player.id))
          } else if (player.contractType === 'lendO' || (player.contractType === 'lendR' && player.repaid === 'yes')) {
            this.firstTeamValue += (+player.value < +player.repaidValue) ? +player.repaidValue : player.value
            this.finalFirstTeamValues.push(new Player(+player.value, player.quot,
              player.contractType, player.contractLength, null, null,
              null, null, (+player.value / +player.quot * +player.finalQuot < +player.repaidValue) ?
              +player.repaidValue : +player.value / +player.quot * +player.finalQuot, player.id))
          } else {
            this.firstTeamValue += +player.value / +player.quot * +player.finalQuot * (+player.contractLength / 12) * 0.8
            this.finalFirstTeamValues.push(new Player(+player.value,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, +player.value / +player.quot *
              +player.finalQuot * (+player.contractLength / 12) * 0.8, player.id))
          }
          if (player.bonusList) {
            player.bonusList.forEach(
              bonus => {
                this.secondTeamValue += bonus.events * bonus.reward
              }
            )
          }
        }
      )
      this.secondTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot
            this.finalSecondTeamValues.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null,
              null, null, +player.value / +player.quot * +player.finalQuot, player.id))
          } else if (player.contractType === 'lendO') {
            this.secondTeamValue += (+player.value < +player.repaidValue) ? +player.repaidValue : player.value
            this.finalSecondTeamValues.push(new Player(+player.value, player.quot,
              player.contractType, player.contractLength, null, null,
              null, null, (+player.value / +player.quot * +player.finalQuot < +player.repaidValue) ?
              +player.repaidValue : +player.value / +player.quot * +player.finalQuot, player.id))
          } else {
            this.secondTeamValue += +player.value / +player.quot * +player.finalQuot * (+player.contractLength / 12) * 0.8
            this.finalSecondTeamValues.push(new Player(+player.value,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, +player.value / +player.quot *
              +player.finalQuot * (+player.contractLength / 12) * 0.8, player.id))
          }
          if (player.bonusList) {
            player.bonusList.forEach(
              bonus => {
                this.firstTeamValue += bonus.events * bonus.reward
              }
            )
          }
        }
      )

      console.log(this.firstTeamValue - this.secondTeamValue)

      if (this.firstTeamValue > this.secondTeamValue) {
        let finalSecondTeamValues = this.addRightValueProportionally(this.firstTeamValue - this.secondTeamValue, this.finalSecondTeamValues)
        this.finalSecondTeamValues = []
        finalSecondTeamValues.forEach(
          value => {
            this.finalSecondTeamValues.push(value)
          }
        )
      } else if (this.firstTeamValue < this.secondTeamValue) {
        let finalFirstTeamValues = this.addRightValueProportionally(this.secondTeamValue - this.firstTeamValue, this.finalFirstTeamValues)
        this.finalFirstTeamValues = []
        finalFirstTeamValues.forEach(
          value => {
            this.finalFirstTeamValues.push(value)
          }
        )
      }

    } else {
      this.firstTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.firstTeamValue += +player.value
            this.finalFirstTeamValues.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else if (player.contractType === 'lendO') {
            this.firstTeamValue += +player.repaidValue
            this.finalFirstTeamValues.push(new Player(+player.repaidValue, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else {
            this.firstTeamValue += +player.value * (+player.contractLength / 12) * 0.8
            this.finalFirstTeamValues.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, null, player.id))
          }
          if (player.bonusList) {
            player.bonusList.forEach(
              bonus => {
                this.secondTeamValue += bonus.events * bonus.reward
              }
            )
          }
        }
      )
      this.secondTeam.forEach(
        player => {
          if (player.contractType === 'def') {
            this.secondTeamValue += +player.value
            this.finalSecondTeamValues.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else if (player.contractType === 'lendO') {
            this.secondTeamValue += +player.repaidValue
            this.finalSecondTeamValues.push(new Player(+player.repaidValue, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
          } else {
            this.secondTeamValue += +player.value * (+player.contractLength / 12) * 0.8
            this.finalSecondTeamValues.push(new Player(+player.value * (+player.contractLength / 12) * 0.8,
              player.quot, player.contractType, player.contractLength, null, player.repaid, null, null, null, player.id))
          }
          if (player.bonusList) {
            player.bonusList.forEach(
              bonus => {
                this.firstTeamValue += bonus.events * bonus.reward
              }
            )
          }
        }
      )

      console.log(this.firstTeamValue - this.secondTeamValue)

      if (this.firstTeamValue > this.secondTeamValue) {
        let finalSecondTeamValues = this.addValueProportionally(this.firstTeamValue - this.secondTeamValue, this.finalSecondTeamValues)
        this.finalSecondTeamValues = []
        finalSecondTeamValues.forEach(
          value => {
            this.finalSecondTeamValues.push(value)
          }
        )
      } else if (this.firstTeamValue < this.secondTeamValue) {
        let finalFirstTeamValues = this.addValueProportionally(this.secondTeamValue - this.firstTeamValue, this.finalFirstTeamValues)
        this.finalFirstTeamValues = []
        finalFirstTeamValues.forEach(
          value => {
            this.finalFirstTeamValues.push(value)
          }
        )
      }
    }
  }

  addValueProportionally(value: number, values: Player[]) {
    let sum = values.reduce((a, b) => a + b.value, 0)

    let newValues = []
    values.forEach(
      player => {
        if (player.contractType == "lend" || player.repaid == "no") {
          newValues.push(new Player((player.value + player.value / sum * value) * (12 / +player.contractLength) / 0.8, player.quot, player.contractType, player.contractLength,
            null, null, null, null, null, player.id))
        } else {
          newValues.push(new Player(player.value + player.value / sum * value, player.quot, player.contractType, player.contractLength,
            null, null, null, null, null, player.id))
        }
      }
    )
    return newValues
  }

  addRightValueProportionally(value: number, values: Player[]) {
    let sum = values.reduce((a, b) => a + b.finalValue, 0)

    let newValues = []
    values.forEach(
      player => {
        if (player.contractType == "lend" || player.repaid == "no") {
          newValues.push(new Player(((player.finalValue < player.value + player.finalValue / sum * value) ? (player.value + player.finalValue / sum * value)
            : player.finalValue) * (12 / +player.contractLength) / 0.8, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
        } else {
          newValues.push(new Player((player.finalValue < player.value + player.finalValue / sum * value) ? player.value + player.finalValue / sum * value :
            player.finalValue, player.quot, player.contractType, player.contractLength, null, null, null, null, null, player.id))
        }
      }
    )
    return newValues
  }

  checkIfRightLend(): boolean {
    console.log(this.firstTeam)
    console.log(this.secondTeam)
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
