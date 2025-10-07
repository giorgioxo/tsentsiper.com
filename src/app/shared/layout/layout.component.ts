import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuService } from '../../core/menu.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  isNavigationMenuOpen = false;

  constructor(private menuService: MenuService) {}

  toggleNavigationMenu() {
    this.isNavigationMenuOpen = !this.isNavigationMenuOpen;
    this.menuService.setMenuOpen(this.isNavigationMenuOpen);
  }
}