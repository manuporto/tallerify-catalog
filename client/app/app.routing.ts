import { Routes, RouterModule, CanActivate } from '@angular/router';
// import { AuthGuard } from './auth-guard.service';

import { LoginComponent } from './login/login.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { UserDetailsComponent } from './users/user-details/user-details.component';
import { PageNotFoundComponent } from './page-not-found.component';

const appRoutes: Routes = [
  {
    path: 'users',
    component: UserListComponent
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
    component: LoginComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

export const routing = RouterModule.forRoot(appRoutes);

export const routedComponents = [UserListComponent, LoginComponent];
