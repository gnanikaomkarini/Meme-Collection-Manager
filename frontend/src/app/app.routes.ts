import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateMemeComponent } from './components/create-meme/create-meme.component';
import { MemeDetailComponent } from './components/meme-detail/meme-detail.component';
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
    path: 'create',
    component: CreateMemeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'meme/:id',
    component: MemeDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
