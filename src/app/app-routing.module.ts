import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MoveUnitViewComponent} from './move-unit-view/move-unit-view.component';
import {ConsoleViewComponent} from './console-view/console-view.component';
import {PlanetTableViewComponent} from './planet-table-view/planet-table-view.component';

const routes: Routes = [
  { path: 'overview', component: PlanetTableViewComponent},
  { path: 'move', component: MoveUnitViewComponent},
  { path: 'console', component: ConsoleViewComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
