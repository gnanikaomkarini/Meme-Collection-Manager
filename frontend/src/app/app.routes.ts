import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard, publicGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
