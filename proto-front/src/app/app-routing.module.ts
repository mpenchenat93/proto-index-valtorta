import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './pages/admin/admin.component';
import { ChartComponent } from './pages/chart/chart.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { InformationComponent } from './pages/information/information.component';

const routes: Routes = [
  { path: 'contact', component: ContactComponent },
  { path: 'home', component: HomeComponent },
  { path: 'chart', component: ChartComponent },
  { path: 'info', component: InformationComponent },
  { path: 'admin', component: AdminComponent },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
