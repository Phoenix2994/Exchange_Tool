import { Component, OnInit, ViewChild } from '@angular/core';
import { ToolService } from '../services/tool.service';
import { Player } from '../model/player';
import { ViewWillEnter } from '@ionic/angular';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements ViewWillEnter {

  firstTeam: Array<Player> = []
  secondTeam: Array<Player> = []

  firstTeamValues: Array<Player> = []
  secondTeamValues: Array<Player> = []

  extra1: number = 0
  extra2: number = 0

  @ViewChild('firstTeamTable') firstTeamTable: MatTable<Player>;
  @ViewChild('secondTeamTable') secondTeamTable: MatTable<Player>;
  @ViewChild('finalFirstTeamTable') finalFirstTeamTable: MatTable<Player>;
  @ViewChild('finalSecondTeamTable') finalSecondTeamTable: MatTable<Player>;

  firstTeamCols: string[] = ['position', 'value', 'contract', 'length', 'bonus', 'remove'];

  finalFirstTeamCols: string[] = ['position', 'value'];

  secondTeamCols: string[] = ['position', 'value', 'contract', 'length', 'bonus', 'remove'];

  finalSecondTeamCols: string[] = ['position', 'value'];

  constructor(private service: ToolService) { }


  ionViewWillEnter() {
    this.firstTeam = []
    this.secondTeam = []
    this.firstTeamValues = []
    this.secondTeamValues = []

    this.service.team1.players.forEach(
      player =>
        this.firstTeam.push(player)
    )
    this.service.team2.players.forEach(
      player =>
        this.secondTeam.push(player)
    )
    if (this.firstTeam.length != 0) {
      this.firstTeamTable.renderRows()
    }

    if (this.secondTeam.length != 0) {
      this.secondTeamTable.renderRows()
    }
    this.service.computeFinalValues()

    this.service.team1.finalPlayers.forEach(
      player => {
        this.firstTeamValues.push(player)
      }
    )
    this.service.team2.finalPlayers.forEach(
      player => {
        this.secondTeamValues.push(player)
      }
    )
    if (this.firstTeam.length != 0) {
      this.finalFirstTeamTable.renderRows()
    }
    if (this.secondTeam.length != 0) {

      this.finalSecondTeamTable.renderRows()
    }
    if (this.firstTeamValues.length == 0) {
      this.firstTeamCols = []
      this.finalFirstTeamCols = []
    } else {
      this.firstTeamCols = ['position', 'value', 'contract', 'length', 'bonus', 'remove'];
      this.finalFirstTeamCols = ['position', 'value'];
    }

    if (this.secondTeamValues.length == 0) {
      this.secondTeamCols = []
      this.finalSecondTeamCols = []
    } else {
      this.secondTeamCols = ['position', 'value', 'contract', 'length', 'bonus', 'remove'];
      this.finalSecondTeamCols = ['position', 'value'];
    }

  }

  setFirstExtra() {
    this.service.$extra1.next(this.extra1)
    this.ionViewWillEnter()
  }

  setSecondExtra() {
    this.service.$extra2.next(this.extra2)
    this.ionViewWillEnter()

  }

  remove(player: Player) {
    this.service.remove(player.id)
    this.ionViewWillEnter()

  }


}
