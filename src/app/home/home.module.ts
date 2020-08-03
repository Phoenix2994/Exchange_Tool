import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { ToolService } from '../services/tool.service';
import { ContractTypeMapPipe } from '../pipes/contract-type-map.pipe';
import { BonusComputePipe } from '../pipes/bonus-compute.pipe';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTabsModule,
    MatButtonModule,
    MatTableModule,
    IonicModule.forRoot({ mode: 'md' })
  ],
  declarations: [
    HomePage,
    ContractTypeMapPipe,
    BonusComputePipe],
  providers: [
    ContractTypeMapPipe,
    BonusComputePipe
  ]
})
export class HomePageModule { }
