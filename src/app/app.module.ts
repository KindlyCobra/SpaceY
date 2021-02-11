import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {ClipboardModule} from '@angular/cdk/clipboard';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlanetTableViewComponent } from './planet-table-view/planet-table-view.component';
import { MoveUnitViewComponent } from './move-unit-view/move-unit-view.component';
import { ChooseUniverseComponent } from './start-menu/choose-universe/choose-universe.component';
import { StartMenuComponent } from './start-menu/start-menu.component';
import { ConnectMetamaskComponent } from './start-menu/connect-metamask/connect-metamask.component';
import { InitialPlanetComponent } from './start-menu/initial-planet/initial-planet.component';
import { IngameComponent } from './ingame/ingame.component';
import { ConsoleViewComponent } from './console-view/console-view.component';


const routes: Routes = [
  { path: "start", component: StartMenuComponent },
  { path: "ingame", component: IngameComponent },
  { path: "**", redirectTo: "start", pathMatch: "full" },
];

@NgModule({
  declarations: [
    AppComponent,
    PlanetTableViewComponent,
    MoveUnitViewComponent,
    ChooseUniverseComponent,
    StartMenuComponent,
    ConnectMetamaskComponent,
    InitialPlanetComponent,
    IngameComponent,
    ConsoleViewComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatExpansionModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatButtonModule,
    RouterModule.forRoot(routes),
    FormsModule,
    ClipboardModule
  ],
  exports: [RouterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
