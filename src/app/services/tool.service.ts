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
        if (player.contractType === 'lend') {
          this.firstTeamValue += +player.value * (+player.contractLength / 12) * 0.8
        } else if (player.repaid === 'no' && player.contractType === 'lendR') {
          this.firstTeamValue += +player.value * (+player.contractLength / 12)
        }
        else {
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
        if (player.contractType === 'lend') {
          this.secondTeamValue += +player.value * (+player.contractLength / 12) * 0.8
        } else if (player.repaid === 'no' && player.contractType === 'lendR') {
          this.secondTeamValue += +player.value * (+player.contractLength / 12)
        }
        else {
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

      this.finalSecondTeam = []
      this.finalFirstTeam = []
      this.finalFirstTeam = JSON.parse(JSON.stringify(finalFirstTeam))
      this.finalSecondTeam = JSON.parse(JSON.stringify(finalSecondTeam))
    }

    if (this.repaid1 != 0 || this.repaid2 != 0) {
      this.finalFirstTeam.forEach(
        (player, index) => {
          if (player.contractType === 'lend') {
            this.finalFirstTeamValue += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) * 0.8
            this.finalFirstTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) * 0.8 / player.quot * player.finalQuot
          } else if (player.repaid === 'no' && player.contractType === 'lendR') {
            this.finalFirstTeamValue += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12)
            this.finalFirstTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) / player.quot * player.finalQuot
          }
          else {
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
          } else if (player.repaid === 'no' && player.contractType === 'lendR') {
            this.finalSecondTeamValue += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12)
            this.finalSecondTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) * (+player.contractLength / 12) / player.quot * player.finalQuot
          } else {
            this.finalSecondTeamValueEval += (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
            this.finalSecondTeamValue += (player.value < player.finalValue ? player.finalValue : player.value)
          }
        }
      )
      //2.3.1
      if (this.firstTeamValue == this.finalFirstTeamValue) {
        //2.3.1.1
        if (this.firstTeamValue + this.bonus2 + this.repaid2 > this.secondTeamValue + this.bonus1 + this.repaid1) {
          // 2.3.1.1.1
          if (this.secondTeamValue - this.extra2 == 0) {
            //2.3.1.1.1.1
            if (this.repaid1/ this.finalFirstTeamValueEval > 1) {
              this.finalFirstTeam.forEach(
                player => {
                  player.finalValue = this.repaid1 * (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot / this.finalFirstTeamValueEval
                }
              )
            } else {
              //2.3.1.1.1.2
              this.finalFirstTeam.forEach(
                player => {
                  player.finalValue = (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
                }
              )
            }
          } else {
            //2.3.1.1.2
            this.finalFirstTeam.forEach(
              player => {
                player.finalValue = player.value / player.quot * player.finalQuot
              }
            )
          }
        } else { //2.3.1.2
          if (this.secondTeamValue - this.extra2 == 0) {
            //2.3.1.2.1
            if (this.repaid1 / this.finalFirstTeamValueEval > 1) {
              //2.3.1.2.1.1
              this.finalFirstTeam.forEach(
                player => {
                  player.finalValue = this.repaid1 * (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot / this.finalFirstTeamValueEval
                }
              )
              console.log(JSON.parse(JSON.stringify(this.finalFirstTeam)))

            } else {
              //2.3.1.2.1.2
              this.finalFirstTeam.forEach(
                player => {
                  player.finalValue = (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot
                }
              )
            }
          } else {
            //2.3.1.2.2

            this.finalFirstTeam.forEach(
              player => {
                console.log((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)

                player.finalValue = (player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot +
                  (this.secondTeamValue + this.bonus1 + this.repaid1 - this.firstTeamValue - this.bonus2 - this.repaid2) * (player.value < player.finalValue ? player.finalValue : player.value)
                  / player.quot * player.finalQuot / this.finalFirstTeamValueEval
              }
            )

          }
        }
        //2.3.2
      } else {
        //2.3.2.1
        if (this.finalSecondTeamValue + this.bonus1 + this.repaid1 > this.finalFirstTeamValue + this.bonus2 + this.repaid2) {
          this.finalFirstTeam.forEach(
            player => {
              player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
                (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.finalFirstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot)
                / (this.finalFirstTeamValueEval)
            }
          )
          //2.3.2.2
        } else {
          if (this.finalSecondTeamValue + this.repaid1 + this.bonus1 > this.firstTeamValue + this.bonus2 + this.repaid2) {
            //2.3.2.3
            this.finalFirstTeam.forEach(
              player => {
                if (player.contractType === 'lend') {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot * 0.8 * (+player.contractLength / 12) +
                    (this.finalFirstTeamValue - this.firstTeamValue) * (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.3.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  }
                  else {
                    //2.3.2.3.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) / 0.8 *
                      (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.firstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                } else if (player.repaid === 'no' && player.contractType === 'lendR') {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot * (+player.contractLength / 12) +
                    (this.finalFirstTeamValue - this.firstTeamValue) * (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.3.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  }
                  else {
                    //2.3.2.3.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) *
                      (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.firstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                } else {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot +
                    (this.finalFirstTeamValue - this.firstTeamValue) * (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.3.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  } else {
                    //2.3.2.3.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
                      (this.finalSecondTeamValue + this.bonus1 + this.repaid1 - this.firstTeamValue - this.bonus2 - this.repaid2) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                }
              }
            )

          } else {
            // 2.3.2.4
            this.finalFirstTeam.forEach(
              player => {
                if (player.contractType === 'lend' || (player.repaid === 'no' && player.contractType === 'lendR')) {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot * 0.8 * (+player.contractLength / 12) +
                    (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) *
                    (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.4.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  } else {
                    //2.3.2.4.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) / 0.8 *
                      (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                } else if (player.repaid === 'no' && player.contractType === 'lendR') {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot * (+player.contractLength / 12) +
                    (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) *
                    (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.4.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  } else {
                    //2.3.2.4.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) + (12 / +player.contractLength) *
                      (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                }
                else {
                  if (((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot +
                    (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) *
                    (player.value < player.finalValue ? player.finalValue : player.value) /
                    (this.finalFirstTeamValue - this.extra1)) < player.value / player.quot * player.finalQuot) {
                    //2.3.2.4.1
                    player.finalValue = (player.value / player.quot * player.finalQuot)
                  } else {
                    //2.3.2.4.2
                    player.finalValue = ((player.value < player.finalValue ? player.finalValue : player.value) / player.quot * player.finalQuot) +
                      (this.finalFirstTeamValue + this.bonus2 + this.repaid2 - this.finalSecondTeamValue - this.bonus1 - this.repaid1) * ((player.value < player.finalValue ? player.finalValue : player.value)) *
                      (this.finalFirstTeamValue - this.extra1)
                  }
                }
              }
            )
          }
        }
      }
    }
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
          if (player.contractType == "lend") {
            player.finalValue = (teamBiggerValue - teamSmallerExtra) * player.value /
              (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
              (player.value / (teamSmallerValue - teamSmallerExtra) * 0.8 * (+player.contractLength / 12))
          } else if (player.repaid === 'no' && player.contractType === 'lendR') { 
            player.finalValue = (teamBiggerValue - teamSmallerExtra) * player.value /
            (teamSmallerValue - teamSmallerExtra) + (teamSmallerBonus - teamBiggerBonus) *
            (player.value / (teamSmallerValue - teamSmallerExtra) * (+player.contractLength / 12))
          }
          else {
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
