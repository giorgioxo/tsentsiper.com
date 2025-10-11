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
  
  // Scroll properties for smooth scrolling
  private scrollPosition = 0;
  private scrollVelocity = 0;
  private isAnimating = false;
  private lastWheelTime = 0;
  private friction = 0.8;
  private minVelocity = 0.5;
  private animationDuration = 250; // SUPER fast - 200ms for instant response
  private startTime = 0;

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

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    const delta = event.deltaY;
    const targetVelocity = delta * 8; // INSTANT response - 8x multiplier

    // Immediate response - no delay
    this.scrollVelocity += targetVelocity * 1.2; // Instant accumulation

    // Higher maximum velocity for faster scrolling
    this.scrollVelocity = Math.max(-1500, Math.min(1500, this.scrollVelocity));

    // Start momentum animation if not already running
    if (!this.isAnimating) {
      this.startMomentumScroll();
    }
  }

  private startMomentumScroll() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.startTime = Date.now();
    this.momentumAnimation();
  }

  private momentumAnimation() {
    if (!this.isAnimating) return;

    const currentTime = Date.now();
    const elapsed = currentTime - this.startTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);

    // Ease-out cubic curve: fast start, slow end
    const easeOut = 1 - Math.pow(1 - progress, 3);
    
    // Apply easing to velocity
    const currentVelocity = this.scrollVelocity * (1 - easeOut);

    // Stop if velocity is too low or animation is complete
    if (Math.abs(currentVelocity) < this.minVelocity || progress >= 1) {
      this.scrollVelocity = 0;
      this.isAnimating = false;
      return;
    }

    // Update scroll position with INSTANT movement
    this.scrollPosition += currentVelocity * 0.05; // INSTANT - 50ms timing for immediate response

    // Ensure position doesn't go below 0
    if (this.scrollPosition < 0) {
      this.scrollPosition = 0;
      this.scrollVelocity = 0;
      this.isAnimating = false;
      return;
    }

    // Update the display with smooth transform
    this.updateProjectTransforms();

    // Continue animation
    requestAnimationFrame(() => this.momentumAnimation());
  }

  private updateProjectTransforms() {
    const projectsList = document.querySelector('.projects-list') as HTMLElement;
    if (projectsList) {
      projectsList.style.transform = `translateY(-${this.scrollPosition}px)`;
    }
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
