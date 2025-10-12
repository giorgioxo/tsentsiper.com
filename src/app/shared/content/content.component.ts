import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/service';
import { MenuService } from '../../core/menu.service';
import { Subscription } from 'rxjs';

interface Stack {
  items: string[];
  range: [number, number]; // [start, end] indices
  direction: 'increasing' | 'decreasing';
}

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit, AfterViewInit, OnDestroy {
  allData: string[] = [];
  stacks: Stack[] = [];
  // Track the absolute data index shown at each [stackIndex, itemIndex] for numbering
  private visibleIndexMap: number[][] = [];
  private isMenuOpen = false;
  private menuSubscription?: Subscription;
  private dataSubscription?: Subscription;
  private scrollPosition = 0;
  private itemHeight = 50; // Normal height
  private itemGap = 32; // Normal gap
  private viewportHeight = 1200;
  private itemsPerStack = 0;
  private scrollVelocity = 0;
  private isAnimating = false;
  private lastWheelTime = 0;
  private wheelDeltaAccumulator = 0;
  private friction = 0.95;
  private minVelocity = 0.1;

  constructor(private dataService: DataService, private menuService: MenuService) {}

  ngOnInit() {
    // Subscribe to backend data stream
    this.dataSubscription = this.dataService
      .getProjectDataObservable()
      .subscribe(data => {
        this.allData = data || [];
        // Recalculate layout when new data arrives
        this.calculateItemsPerStack();
        this.initializeStacks();
      });
    
    // Subscribe to menu state changes
    this.menuSubscription = this.menuService.isMenuOpen$.subscribe(isOpen => {
      this.isMenuOpen = isOpen;
      // Recalculate stacks when menu state changes
      setTimeout(() => {
        this.calculateItemsPerStack();
        this.initializeStacks();
      }, 0);
    });
  }

  ngOnDestroy() {
    if (this.menuSubscription) {
      this.menuSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    // Wait for DOM to be ready before calculating dimensions
    setTimeout(() => {
      // Use actual viewport height
      this.viewportHeight = window.innerHeight || this.viewportHeight;
      this.calculateItemsPerStack();
      this.initializeStacks();
    }, 0);

    // Listen for window resize to recalculate stacks
    window.addEventListener('resize', () => {
      this.viewportHeight = window.innerHeight || this.viewportHeight;
      this.calculateItemsPerStack();
      this.initializeStacks();
    });
  }

  private calculateItemsPerStack() {
    // Calculate how many items fit in viewport height with gaps
    // Use different values based on menu state
    const currentItemHeight = this.isMenuOpen ? 25 : 50; // 50% smaller when menu open
    const currentItemGap = this.isMenuOpen ? 32 : 32; // 32px row gap when menu is open
    const itemHeightWithGap = currentItemHeight + currentItemGap;
    this.itemsPerStack = Math.floor(this.viewportHeight / itemHeightWithGap);
  }

  private calculateNumberOfStacks() {
    // Calculate how many stacks fit horizontally
    // When menu is open, use full width minus margins (32px on each side)
    const availableWidth = this.isMenuOpen ? window.innerWidth - 64 : window.innerWidth - 300 - 35;
    const stackWidth = this.isMenuOpen ? 84 : 140; // 60% of 140px = 84px when menu open
    const stackGap = this.isMenuOpen ? 0 : 104; // We'll offset columns via translateX when menu is open

    // Calculate maximum stacks that fit
    let maxStacks = 1;
    let totalWidth = stackWidth;

    while (totalWidth + stackGap + stackWidth <= availableWidth) {
      totalWidth += stackGap + stackWidth;
      maxStacks++;
    }

    return maxStacks;
  }

  private initializeStacks() {
    this.stacks = [];

    const numberOfStacks = this.calculateNumberOfStacks();
    const totalItemsToShow = numberOfStacks * this.itemsPerStack;

    // Show all items that fit initially (no scrolling required)
    // If we have 300 items and can fit 120, show all 120
    // If we have 8 items and can fit 120, show all 8
    const itemsToShow = Math.min(totalItemsToShow, this.allData.length);

    // Create stacks with dynamic ranges based on itemsPerStack
    for (let i = 0; i < numberOfStacks; i++) {
      const startIndex = i * this.itemsPerStack;
      const endIndex = Math.min(
        startIndex + this.itemsPerStack - 1,
        this.allData.length - 1,
      );

      // Only create stack if it has items to show
      if (startIndex < this.allData.length) {
        this.stacks.push({
          items: [],
          range: [startIndex, endIndex],
          direction: i % 2 === 0 ? 'increasing' : 'decreasing', // Alternate directions
        });
      }
    }

    this.updateStacks();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    event.preventDefault();

    const currentTime = Date.now();
    const delta = event.deltaY;

    // Accumulate wheel delta for momentum
    this.wheelDeltaAccumulator += delta;

    // Calculate velocity based on time difference
    if (this.lastWheelTime > 0) {
      const timeDiff = currentTime - this.lastWheelTime;
      const velocity = (delta / timeDiff) * 1000; // pixels per second

      // Add to existing velocity for momentum
      this.scrollVelocity += velocity * 0.3;

      // Limit maximum velocity
      this.scrollVelocity = Math.max(
        -2000,
        Math.min(2000, this.scrollVelocity),
      );
    }

    this.lastWheelTime = currentTime;

    // Start momentum animation if not already running
    if (!this.isAnimating) {
      this.startMomentumScroll();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        this.scrollVelocity += 300; // Add velocity for key press
        break;
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        this.scrollVelocity -= 300; // Add velocity for key press
        break;
    }

    if (!this.isAnimating) {
      this.startMomentumScroll();
    }
  }

  private startMomentumScroll() {
    if (this.isAnimating) return;

    this.isAnimating = true;
    this.momentumAnimation();
  }

  private momentumAnimation() {
    if (!this.isAnimating) return;

    // Apply friction to velocity
    this.scrollVelocity *= this.friction;

    // Stop if velocity is too low
    if (Math.abs(this.scrollVelocity) < this.minVelocity) {
      this.scrollVelocity = 0;
      this.isAnimating = false;
      return;
    }

    // Update scroll position based on velocity
    this.scrollPosition += this.scrollVelocity * 0.016; // 60fps timing

    // Ensure position doesn't go below 0
    if (this.scrollPosition < 0) {
      this.scrollPosition = 0;
      this.scrollVelocity = 0;
      this.isAnimating = false;
      return;
    }

    // Clamp to maximum scroll so the last item stays in view
    const maxScroll = this.getMaxScrollPosition();
    if (this.scrollPosition > maxScroll) {
      this.scrollPosition = maxScroll;
      this.scrollVelocity = 0;
      this.isAnimating = false;
      this.updateStacks();
      return;
    }

    // Update the display
    this.updateStacks();

    // Continue animation
    requestAnimationFrame(() => this.momentumAnimation());
  }

  private getMaxScrollPosition(): number {
    // Calculate how far we can scroll while keeping the last items visible
    const numberOfStacks = this.calculateNumberOfStacks();
    const totalVisibleItems = numberOfStacks * this.itemsPerStack;

    const currentItemHeight = this.isMenuOpen ? 25 : 50;
    const currentItemGap = this.isMenuOpen ? 32 : 32; // use the same gap used in transforms
    const itemHeightWithGap = currentItemHeight + currentItemGap;

    const maxBaseOffset = Math.max(0, this.allData.length - totalVisibleItems);
    return maxBaseOffset * itemHeightWithGap;
  }

  onScroll(event: Event) {
    event.preventDefault();
  }

  private updateStacks() {
    // Calculate base scroll offset using item height with gap
    // Use different values based on menu state
    const currentItemHeight = this.isMenuOpen ? 25 : 50;
    const currentItemGap = this.isMenuOpen ? 32 : 32; // 32px row gap when menu open
    const itemHeightWithGap = currentItemHeight + currentItemGap;
    const baseOffset = Math.floor(this.scrollPosition / itemHeightWithGap);

    this.visibleIndexMap = [];
    this.stacks.forEach((stack, stackIndex) => {
      stack.items = [];
      this.visibleIndexMap[stackIndex] = [];
      // Calculate the starting point for this stack based on scroll
      const stackStartIndex = stackIndex * this.itemsPerStack + baseOffset;
      for (let i = 0; i < this.itemsPerStack; i++) {
        let dataIndex: number;
        if (stack.direction === 'increasing') {
          dataIndex = stackStartIndex + i;
        } else {
          // For decreasing direction, start from the end and go backwards
          dataIndex = stackStartIndex + this.itemsPerStack - 1 - i;
        }
        // Get data if it exists, otherwise show empty
        if (dataIndex >= 0 && dataIndex < this.allData.length) {
          stack.items.push(this.allData[dataIndex]);
          this.visibleIndexMap[stackIndex][i] = dataIndex;
        } else {
          stack.items.push('');
          this.visibleIndexMap[stackIndex][i] = -1;
        }
      }
    });
  }

  // Return a descending number like admin: total - index
  getItemNumber(itemIndex: number, stackIndex: number): number | null {
    const absoluteIndex = this.visibleIndexMap?.[stackIndex]?.[itemIndex] ?? -1;
    if (absoluteIndex < 0) return null;
    return this.allData.length - absoluteIndex;
  }

  getItemTransform(index: number, stackIndex: number): string {
    // Use different values based on menu state
    const currentItemHeight = this.isMenuOpen ? 25 : 50;
    const currentItemGap = this.isMenuOpen ? 32 : 32; // 32px row gap when menu open
    const itemHeightWithGap = currentItemHeight + currentItemGap;
    const fractionalScroll =
      (this.scrollPosition % itemHeightWithGap) / itemHeightWithGap;
    const stack = this.stacks[stackIndex];

    // Base movement for smooth scroll depending on direction
    const baseTranslate = stack.direction === 'increasing'
      ? -fractionalScroll * itemHeightWithGap
      : fractionalScroll * itemHeightWithGap;

    // Add fixed per-item gap offset so spacing comes from TS, not CSS
    const gapOffset = index * currentItemGap;
    const columnOffsetX = this.isMenuOpen ? stackIndex * 72 : 0; // 72px column spacing via transform

    return `translate(${columnOffsetX}px, ${baseTranslate + gapOffset}px)`;
  }

  getItemTransition(index: number): string {
    return 'none'; // No CSS transitions, JavaScript handles all animation
  }
}
