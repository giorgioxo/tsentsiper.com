import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { ContentComponent } from './shared/content/content.component';

export const routes: Routes = [
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
