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
  value: string
  quot: number
  finalQuot: number
  contractType: string
  contractLength: string
  repaidValue: string
  repaid: string
  bonus: string
  bonus1Number: string
  bonus1Reward: string
  bonus2Number: string
  bonus2Reward: string

  ngOnInit() {
    this.bonus = '0'
    this.contractType = 'def'
    this.repaid = 'no'
    this.id = this.route.snapshot.paramMap.get('id');
  }

  save() {
    let bonus = []
    if (this.bonus === "1") {
      bonus.push(new Bonus(+(this.bonus1Number.replace(/,/g, '.')), +(this.bonus1Reward.replace(/,/g, '.'))))
    } else if (this.bonus === "2") {
      bonus.push(new Bonus(+(this.bonus1Number.replace(/,/g, '.')), +(this.bonus1Reward.replace(/,/g, '.'))))
      bonus.push(new Bonus(+(this.bonus2Number.replace(/,/g, '.')), +(this.bonus2Reward.replace(/,/g, '.'))))
    }
    this.service.save(+this.id, new Player(+(this.value.replace(/,/g, '.')), +this.quot, this.contractType, this.contractLength, bonus, this.repaid, this.repaidValue ? +(this.repaidValue.replace(/,/g, '.')) : null,
      this.finalQuot ? +this.finalQuot : +this.quot, +(this.value.replace(/,/g, '.'))))
    this.router.navigate(['/home'])
  }

}
