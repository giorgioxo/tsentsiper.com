import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { ContentComponent } from './shared/content/content.component';
import { LoginComponent } from './features/login/login';
import { AdminComponent } from './features/admin/admin';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '**',
        component: ContentComponent
      }
    ]
  }
];
