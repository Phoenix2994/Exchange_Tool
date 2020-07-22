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

  displayedColumns: string[] = ['position', 'value', 'remove'];

  finalDisplayedColumns: string[] = ['position', 'value'];


  constructor(private service: ToolService) { }


  ionViewWillEnter() {
    this.firstTeam = []
    this.secondTeam = []
    this.firstTeamValues = []
    this.secondTeamValues = []

    this.service.firstTeam.forEach(
      value =>
        this.firstTeam.push(value)
    )
    this.service.secondTeam.forEach(
      value =>
        this.secondTeam.push(value)
    )
      this.firstTeamTable.renderRows()

    
      this.secondTeamTable.renderRows()
    
    this.service.computeFinalValues()

    this.service.finalFirstTeamValues.forEach(
      player => {
        if (player.value < player.finalValue) {
          player.value = player.finalValue
        }
        this.firstTeamValues.push(player)

      }
    )
    this.service.finalSecondTeamValues.forEach(
      player => {
        if (player.value < player.finalValue) {
          player.value = player.finalValue
        }
        this.secondTeamValues.push(player)
      }
    )
      this.finalFirstTeamTable.renderRows()

    
      this.finalSecondTeamTable.renderRows()
    

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
