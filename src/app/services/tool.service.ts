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

  diffFirstTeam = []
  diffSeconTeam = []

  firstTeamValue = 0
  secondTeamValue = 0

  $extra1: Subject<number>
  $extra2: Subject<number>

  extra1: number = 0
  extra2: number = 0

  bonus1: number = 0
  bonus2: number = 0

  repaid1: number = 0
  repaid2: number = 0

  finalFirstTeamValue = 0
  finalSecondTeamValue = 0
  finalFirstTeamValueEval = 0
  finalSecondTeamValueEval = 0
  globalId = 0

  constructor() {
    this.$extra1 = new Subject<number>()
    this.$extra2 = new Subject<number>()

    this.$extra1.subscribe(
      value => this.extra1 = +value
    )
    this.$extra2.subscribe(
      value => this.extra2 = +value
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
    this.finalFirstTeamValue = +this.extra1
    this.finalSecondTeamValue = +this.extra2
    this.finalFirstTeamValueEval = 0
    this.finalSecondTeamValueEval = 0
    this.repaid1 = 0
    this.repaid2 = 0
    console.log(this.firstTeam)
    console.log(this.secondTeam)


    this.firstTeam.forEach(
      player => {
        if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
          this.firstTeamValue += +player.value * (+player.contractLength / 12) * 0.8
        } else {
          this.firstTeamValue += +player.value
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
        if (player.repaid == 'yes') {
          this.repaid1 += player.repaidValue
        }
      }
    )

    this.secondTeam.forEach(
      player => {
        if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
          this.secondTeamValue += +player.value * (+player.contractLength / 12) * 0.8
        } else {
          this.secondTeamValue += +player.value
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
        if (player.repaid == 'yes') {
          this.repaid2 += player.repaidValue
        }
      }
    )

    this.finalFirstTeam = JSON.parse(JSON.stringify(this.firstTeam))
    this.finalSecondTeam = JSON.parse(JSON.stringify(this.secondTeam))


    console.log(this.firstTeamValue - this.secondTeamValue)

    this.bonus1 = this.bonusFirstTeam.reduce((a, b) => a + b, 0)
    this.bonus2 = this.bonusSecondTeam.reduce((a, b) => a + b, 0)

    if (this.firstTeamValue >= this.secondTeamValue) {

      let finalFirstTeam = JSON.parse(JSON.stringify(this.getFirstTeam(this.firstTeamValue, this.secondTeamValue, this.bonus1, this.bonus2, this.finalFirstTeam, this.bonusFirstTeam)))
      let finalSecondTeam = JSON.parse(JSON.stringify(this.getSecondTeam(this.firstTeamValue, this.secondTeamValue, this.bonus1, this.bonus2, this.extra1, this.extra2, this.finalSecondTeam, this.bonusSecondTeam)))
      this.finalSecondTeam = []
      this.finalFirstTeam = []
      this.finalFirstTeam = JSON.parse(JSON.stringify(finalFirstTeam))
      this.finalSecondTeam = JSON.parse(JSON.stringify(finalSecondTeam))

    } else if (this.firstTeamValue < this.secondTeamValue) {
      let finalSecondTeam = JSON.parse(JSON.stringify(this.getFirstTeam(this.secondTeamValue, this.firstTeamValue, this.bonus2, this.bonus1, this.finalSecondTeam, this.bonusSecondTeam)))
      let finalFirstTeam = JSON.parse(JSON.stringify(this.getSecondTeam(this.secondTeamValue, this.firstTeamValue, this.bonus2, this.bonus1, this.extra2, this.extra1, this.finalFirstTeam, this.bonusFirstTeam)))
      console.log(finalFirstTeam)

      this.finalSecondTeam = []
      this.finalFirstTeam = []
      this.finalFirstTeam = JSON.parse(JSON.stringify(finalFirstTeam))
      this.finalSecondTeam = JSON.parse(JSON.stringify(finalSecondTeam))
    }

    this.finalFirstTeam.forEach(
      (player, index) => {
        if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
          this.finalFirstTeamValue += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) * 0.8
          this.finalFirstTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) * 0.8 / player.quot * player.finalQuot
        } else {
          this.finalFirstTeamValue += (player.value < player.finalValue ? player.finalValue : player.value)
          this.finalFirstTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
        }
      }
    )
    this.finalSecondTeam.forEach(
      (player, index) => {
        if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
          this.finalSecondTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) * 0.8 / player.quot * player.finalQuot
          this.finalSecondTeamValue += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12)

        } else {
          this.finalSecondTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
          this.finalSecondTeamValue += (player.value < player.finalValue ? player.finalValue : player.value)
        }
      }
    )
    if (this.firstTeamValue == this.finalFirstTeamValue) {
      if (this.firstTeamValue + this.bonus2 + this.repaid2 > this.secondTeamValue + this.bonus1 + this.repaid1) {
        this.finalFirstTeam.forEach(
          player => {
            player.finalValue = (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
          }
        )
        this.finalSecondTeam.forEach(
          player => {
            player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
              (this.firstTeamValue + this.bonus2 + this.repaid2 - this.secondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
              / (this.finalSecondTeamValueEval)
          }
        )
      } else {
        this.finalSecondTeam.forEach(
          player => {
            player.finalValue = (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
          }
        )
        this.finalFirstTeam.forEach(
          player => {
            player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
              (this.secondTeamValue + this.bonus1 + this.repaid1 - this.firstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
              / (this.finalFirstTeamValueEval)
          }
        )
      }
    } else {
      if (this.finalSecondTeamValue + this.bonus1 + this.repaid1 > this.finalFirstTeamValue + this.bonus2 + this.repaid2) {
        this.finalFirstTeam.forEach(
          player => {
            player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
              (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.finalFirstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
              / (this.finalFirstTeamValueEval)
          }
        )
        this.finalSecondTeam.forEach(
          player => {
            if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
              player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) / 0.8 *
                (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                (this.finalSecondTeamValue - this.extra2)
            } else {
              player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
                (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
                / (this.finalSecondTeamValue - this.extra2)
            }
          }
        )
      } else {
        this.finalFirstTeam.forEach(
          player => {
            if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
              player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) / 0.8 *
                (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.finalFirstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                (this.finalFirstTeamValue - this.extra1)
            } else {
              player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
                (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.finalFirstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
                / (this.finalFirstTeamValue - this.extra1)
            }
          }
        )
        this.finalSecondTeam.forEach(
          player => {
            player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
              (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
              / (this.finalSecondTeamValueEval)
          }
        )
      }

    }


    /*
    this.diffFirstTeam = []
    this.diffSeconTeam = []

    this.finalFirstTeamValue = 0
    this.finalSecondTeamValue = 0

    let firstSumDiffValues = 0
    this.finalFirstTeam.forEach(
      (player, index) => {
        if (player.finalValue >= player.value) {
          firstSumDiffValues += player.finalValue - player.value
          this.finalFirstTeamValue += player.finalValue / player.quot * player.finalQuot
          this.diffFirstTeam.push(player.finalValue - player.value)
        } else {
          this.diffFirstTeam.push(0)
          this.finalFirstTeamValue += player.value / player.quot * player.finalQuot
        }
      }
    )

    let secondSumDiffValues = 0
    this.finalSecondTeam.forEach(
      (player, index) => {
        if (player.finalValue >= player.value) {
          secondSumDiffValues += player.finalValue - player.value
          console.log(secondSumDiffValues)

          this.finalSecondTeamValue += player.finalValue / player.quot * player.finalQuot
          this.diffSeconTeam.push(player.finalValue - player.value)
        } else {
          this.diffSeconTeam.push(0)
          this.finalSecondTeamValue += player.value / player.quot * player.finalQuot
        }
      }
    )

    if (this.repaid1 > this.repaid2) {
      if (secondSumDiffValues >= this.repaid1 - this.repaid2) {
        this.finalSecondTeam.forEach(
          (player, index) => {
            player.finalValue = ((this.repaid1 - this.repaid2) *
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) / this.finalSecondTeamValue) < this.diffSeconTeam[index] ?
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) - (this.repaid1 - this.repaid2) *
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) / this.finalSecondTeamValue : 
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot)
              - this.diffSeconTeam[index]
          })
          this.finalFirstTeam.forEach(
            (player, index) => {
              player.finalValue = (player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot
               
            })
      } else {

        console.log(secondSumDiffValues)
        let repaidDiff = this.repaid1 - this.repaid2 - secondSumDiffValues
        console.log(repaidDiff)
        this.finalSecondTeam.forEach(
          (player, index) => {
            player.finalValue = ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot)
              - this.diffSeconTeam[index]
          }
        )

        repaidDiff = secondSumDiffValues == 0 ? repaidDiff - this.firstTeamValue + this.secondTeamValue: repaidDiff
        this.finalFirstTeam.forEach(
          (player, index) => {
            console.log(player.value)
            console.log(this.finalFirstTeamValue)
            player.finalValue = ((player.finalValue < player.value) ? player.value : player.finalValue / +player.quot * +player.finalQuot)
              + repaidDiff * ((player.finalValue < player.value) ? player.value : player.finalValue / +player.quot * +player.finalQuot) / this.finalFirstTeamValue
          }
        )

      }
    } else if (this.repaid1 < this.repaid2) {
      if (firstSumDiffValues >= this.repaid2 - this.repaid1) {
        this.finalFirstTeam.forEach(
          (player, index) => {
            player.finalValue = ((this.repaid2 - this.repaid1) *
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) / this.finalFirstTeamValue) <
               this.diffFirstTeam[index] ?
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) - (this.repaid2 - this.repaid1) *
              ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) / this.finalFirstTeamValue :
               ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot)
              - this.diffFirstTeam[index]
          }
        )
        this.finalSecondTeam.forEach(
          (player, index) => {
            player.finalValue = (player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot
             
          })
      } else {
        let repaidDiff = this.repaid2 - this.repaid1 - firstSumDiffValues
        this.finalFirstTeam.forEach(
          (player, index) => {
            repaidDiff -= this.diffFirstTeam[index]
            player.finalValue = ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot)
              - this.diffFirstTeam[index]
          }
        )
        repaidDiff = secondSumDiffValues == 0 ? repaidDiff - this.secondTeamValue +this.firstTeamValue : repaidDiff

        this.finalSecondTeam.forEach(
          (player, index) => {
            player.finalValue = ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot)
              + repaidDiff * ((player.finalValue < player.value) ? player.value : player.finalValue / player.quot * player.finalQuot) / this.finalSecondTeamValue
          }
        )
      }
    }*/
  }
  //}

  getFirstTeam(teamBiggerValue: number, teamSmallerValue: number, teamBiggerBonus: number, teamSmallerBonus: number, players: Player[], bonusSequence: number[]) {
    //FIRST BIG TEAM

    if (teamBiggerValue + teamSmallerBonus > teamSmallerValue + teamBiggerBonus) {
      return players
    } else {
      players.forEach(
        (player, index) => {
          player.finalValue = player.value + (teamSmallerValue + teamBiggerBonus - teamBiggerValue + teamSmallerBonus) * bonusSequence[index] / teamBiggerBonus, player.id
        }
      )
      return players
    }
  }

  getSecondTeam(teamBiggerValue: number, teamSmallerValue: number, teamBiggerBonus: number, teamSmallerBonus: number, teamBiggerExtra: number, teamSmallerExtra: number,
    players: Player[], bonusSequence: number[]) {
    //SECOND BIG TEAM
    if (teamSmallerBonus > teamBiggerBonus) {
      players.forEach(
        (player, index) => {
          player.finalValue = (teamBiggerValue - teamSmallerExtra) *
            player.value / (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
            bonusSequence[index] / teamSmallerBonus
        }
      )
      return players
    } else {
      players.forEach(
        (player, index) => {
          if (player.contractType == "lend" || (player.repaid == "no" && player.contractType === 'lendR')) {
            player.finalValue = (teamBiggerValue - teamSmallerExtra) * player.value /
              (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
              (player.value / (teamSmallerValue - teamSmallerExtra) * 0.8 * (+player.contractLength / 12))
          } else {
            player.finalValue = (teamBiggerValue - teamSmallerExtra) * player.value /
              (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
              (player.value / (teamSmallerValue - teamSmallerExtra))
            console.log(player.finalValue)
            console.log(players)
          }
        }
      )
      return players
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
