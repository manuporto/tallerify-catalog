import { Routes, RouterModule, CanActivate } from '@angular/router';
// import { AuthGuard } from './auth-guard.service';

import { LoginComponent } from './login/login.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';

const appRoutes: Routes = [
  {
    path: '/',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '/login',
    component: LoginComponent
  }
];

export const routing = RouterModule.forRoot(appRoutes);

export const routedComponents = [LoginComponent];
