import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToolService } from '../services/tool.service';
import { Player } from '../model/player';
import { Bonus } from '../model/bonus';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
})
export class PlayerPage implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private service: ToolService) { }

  id: string
  value: number
  quot: number
  finalQuot: number
  contractType: string
  contractLength: string
  repaidValue: number
  repaid: string
  bonus: string
  bonus1Number: number
  bonus1Reward: number
  bonus2Number: number
  bonus2Reward: number

  ngOnInit() {
    this.bonus = '0'
    this.contractType = 'def'
    this.repaid = 'no'
    this.id = this.route.snapshot.paramMap.get('id');
  }

  save() {
    let bonus = []
    if (this.bonus === "1") {
      bonus.push(new Bonus(this.bonus1Number, this.bonus1Reward))
    } else if (this.bonus === "2") {
      bonus.push(new Bonus(this.bonus1Number, this.bonus1Reward))
      bonus.push(new Bonus(this.bonus2Number, this.bonus2Reward))
    }
    this.service.save(+this.id, new Player(this.value, this.quot, this.contractType, this.contractLength, bonus, this.repaid, this.repaidValue,
       this.finalQuot ? this.finalQuot : this.quot))
    this.router.navigate(['/home'])
  }

}
