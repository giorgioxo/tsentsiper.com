import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {
  @ViewChild('itemsList', { static: false }) itemsList!: ElementRef;
  
  items: string[] = [];
  editingItem: string | null = null;
  editingIndex: number = -1;
  newItemText: string = '';
  showScrollToTop: boolean = false;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadItems();
  }

  loadItems() {
    this.items = this.dataService.getProjectData();
  }

  startEdit(index: number) {
    this.editingIndex = index;
    this.editingItem = this.items[index];
  }

  saveEdit() {
    if (this.editingIndex !== -1 && this.editingItem) {
      this.items[this.editingIndex] = this.editingItem;
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingIndex = -1;
    this.editingItem = null;
  }

  removeItem(index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.items.splice(index, 1);
    }
  }

  addNewItem() {
    if (this.newItemText.trim()) {
      this.items.unshift(this.newItemText.trim());
      this.newItemText = '';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  scrollToTop() {
    if (this.itemsList) {
      this.itemsList.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    this.showScrollToTop = target.scrollTop > 200;
  }
}
