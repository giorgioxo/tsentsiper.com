import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { DataService } from '../../core/service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  @ViewChild('itemsList', { static: false }) itemsList!: ElementRef;
  
  items: string[] = [];
  editingItem: string | null = null;
  editingIndex: number = -1;
  newItemText: string = '';
  showScrollToTop: boolean = false;
  isLoading: boolean = true;
  showAddForm: boolean = false;
  mode: 'manage' | 'add' = 'manage';
  newProjectText: string = '';
  private dataSubscription?: Subscription;

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

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  loadItems() {
    this.isLoading = true;
    
    // Subscribe to data changes
    this.dataSubscription = this.dataService.getProjectDataObservable().subscribe(data => {
      console.log('Data received:', data.length, 'items');
      this.items = [...data];
      this.isLoading = false;
    });
  }

  setMode(mode: 'manage' | 'add') {
    this.mode = mode;
    this.cancelEdit();
  }

  enterNewProject() {
    const text = this.newProjectText.trim();
    if (!text) return;
    // Add locally and via service
    this.dataService.addProject(text);
    this.newProjectText = '';
  }

  clearNewText() {
    this.newProjectText = '';
  }

  saveAllChanges() {
    // Placeholder for future backend persistence
    alert('Changes saved (frontend). We will wire backend persistence next.');
  }

  startEdit(index: number) {
    this.editingIndex = index;
    this.editingItem = this.items[index];
    // Focus the textarea after view update
    setTimeout(() => {
      const textarea = document.querySelector('.edit-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
      }
    }, 0);
  }

  saveEdit() {
    if (this.editingIndex !== -1 && this.editingItem) {
      this.dataService.updateProject(this.editingIndex, this.editingItem);
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingIndex = -1;
    this.editingItem = null;
  }

  removeItem(index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.dataService.deleteProject(index);
    }
  }

  addNewItem() {
    if (this.newItemText.trim()) {
      this.dataService.addProject(this.newItemText.trim());
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
