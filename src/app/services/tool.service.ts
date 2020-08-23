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

  bonus1: number = 0
  bonus2: number = 0

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

    this.firstTeam.forEach(
      player => {
        if (player.contractType === 'def') {
          this.firstTeamValue += +player.value
          this.finalFirstTeam.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid, player.repaidValue,
            player.finalQuot, player.finalValue, player.id))
        } else {
          this.firstTeamValue += +player.value * (+player.contractLength / 12) * 0.8
          this.finalFirstTeam.push(new Player(+player.value,
            player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid, player.repaidValue,
            player.finalQuot, player.finalValue, player.id))
        }
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
        if (player.contractType === 'def') {
          this.secondTeamValue += +player.value
          this.finalSecondTeam.push(new Player(+player.value, player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid, player.repaidValue,
            player.finalQuot, player.finalValue, player.id))
        } else {
          this.secondTeamValue += +player.value * (+player.contractLength / 12) * 0.8
          this.finalSecondTeam.push(new Player(+player.value,
            player.quot, player.contractType, player.contractLength, player.bonusList, player.repaid, player.repaidValue,
            player.finalQuot, player.finalValue, player.id))
        }
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

    // compute bonus for teams
    console.log(this.firstTeamValue - this.secondTeamValue)

    this.bonus1 = this.bonusFirstTeam.reduce((a, b) => a + b, 0)
    this.bonus2 = this.bonusSecondTeam.reduce((a, b) => a + b, 0)

    if (this.firstTeamValue > this.secondTeamValue) {

      let finalFirstTeam = this.getFirstTeam(this.firstTeamValue, this.secondTeamValue, this.bonus1, this.bonus2, this.finalFirstTeam, this.bonusFirstTeam)
      let finalSecondTeam = this.getSecondTeam(this.firstTeamValue, this.secondTeamValue, this.bonus1, this.bonus2, this.extra1, this.extra2, this.finalSecondTeam, this.bonusSecondTeam)
      this.finalSecondTeam = []
      this.finalFirstTeam = []
      finalFirstTeam.forEach(
        value => this.finalFirstTeam.push(value)
      )
      finalSecondTeam.forEach(
        value => {
          this.finalSecondTeam.push(value)
        }
      )

    } else if (this.firstTeamValue < this.secondTeamValue) {
      let finalSecondTeam = this.getFirstTeam(this.secondTeamValue, this.firstTeamValue, this.bonus2, this.bonus1, this.finalSecondTeam, this.bonusSecondTeam)
      let finalFirstTeam = this.getSecondTeam(this.secondTeamValue, this.firstTeamValue, this.bonus2, this.bonus1, this.extra2, this.extra1, this.finalFirstTeam, this.bonusFirstTeam)
      this.finalSecondTeam = []
      this.finalFirstTeam = []
      finalFirstTeam.forEach(
        value => this.finalFirstTeam.push(value)
      )
      finalSecondTeam.forEach(
        value => {
          this.finalSecondTeam.push(value)
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
  //}

  getFirstTeam(teamBiggerValue: number, teamSmallerValue: number, teamBiggerBonus: number, teamSmallerBonus: number, players: Player[], bonusSequence: number[]) {
    //FIRST BIG TEAM
    if (teamBiggerValue + teamSmallerBonus > teamSmallerValue + teamBiggerBonus) {
      return players
    } else {
      let newPlayers = []
      players.forEach(
        (player, index) => {
          newPlayers.push(new Player(player.value, player.quot, player.contractType, player.contractLength,
            null, null, null, null, player.value + (teamSmallerValue + teamBiggerBonus - teamBiggerValue + teamSmallerBonus) * bonusSequence[index] / teamBiggerBonus, player.id))
        }
      )
      return newPlayers
    }
  }

  getSecondTeam(teamBiggerValue: number, teamSmallerValue: number, teamBiggerBonus: number, teamSmallerBonus: number, teamBiggerExtra: number, teamSmallerExtra: number,
    players: Player[], bonusSequence: number[]) {
    //SECOND BIG TEAM
    if (teamSmallerBonus > teamBiggerBonus) {
      let newPlayers = []
      players.forEach(
        (player, index) => {
          console.log(teamSmallerValue)
          console.log(teamSmallerExtra)
          newPlayers.push(new Player(player.value, player.quot, player.contractType, player.contractLength,
            null, null, null, null, (teamBiggerValue - teamSmallerExtra) * player.value / (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
            bonusSequence[index] / teamSmallerBonus, player.id))
        }
      )
      return newPlayers
    } else {
      let newPlayers = []
      players.forEach(
        (player, index) => {
          if (player.contractType == "lend") {
            newPlayers.push(new Player(player.value, player.quot, player.contractType, player.contractLength,
              null, null, null, null, (teamBiggerValue - teamSmallerExtra) * player.value / (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
              (player.value / (teamSmallerValue - teamSmallerExtra) * 0.8 * (+player.contractLength / 12)), player.id))
          } else {
            newPlayers.push(new Player(player.value, player.quot, player.contractType, player.contractLength,
              null, null, null, null, (teamBiggerValue - teamSmallerExtra) * player.value / (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
              (player.value / (teamSmallerValue - teamSmallerExtra)), player.id))
          }
        }
      )
      return newPlayers
    }
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
