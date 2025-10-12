import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuService } from '../../core/menu.service';
import { DataService } from '../../core/service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  isNavigationMenuOpen = false;
  categories: { name: string; count: number }[] = [];
  currentCategory: string | null = null;

  constructor(private menuService: MenuService, private dataService: DataService) {
    this.dataService.categories$.subscribe(rows => {
      this.categories = rows || [];
    });
    this.dataService.selectedCategory$.subscribe(name => {
      this.currentCategory = name || null;
    });
  }

  toggleNavigationMenu() {
    const next = !this.isNavigationMenuOpen;
    this.isNavigationMenuOpen = next;
    this.menuService.setMenuOpen(next);
    // When opening the sort menu, clear category so the background shows all items
    if (next) {
      this.dataService.setCategory(null);
    }
  }

  selectCategory(name: string) {
    this.dataService.setCategory(name);
    this.isNavigationMenuOpen = false;
    this.menuService.setMenuOpen(false);
  }
}