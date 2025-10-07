import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/service';

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
export class ContentComponent implements OnInit, AfterViewInit {
  allData: string[] = [];
  stacks: Stack[] = [];
  private scrollPosition = 0;
  private itemHeight = 50;
  private itemGap = 32;
  private viewportHeight = 1200;
  private itemsPerStack = 0;
  private scrollVelocity = 0;
  private isAnimating = false;
  private lastWheelTime = 0;
  private wheelDeltaAccumulator = 0;
  private friction = 0.95;
  private minVelocity = 0.1;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.allData = this.dataService.getProjectData();
  }

  ngAfterViewInit() {
    // Wait for DOM to be ready before calculating dimensions
    setTimeout(() => {
      this.calculateItemsPerStack();
      this.initializeStacks();
    }, 0);

    // Listen for window resize to recalculate stacks
    window.addEventListener('resize', () => {
      this.calculateItemsPerStack();
      this.initializeStacks();
    });
  }

  private calculateItemsPerStack() {
    // Calculate how many items fit in viewport height with gaps
    const itemHeightWithGap = this.itemHeight + this.itemGap;
    this.itemsPerStack = Math.floor(this.viewportHeight / itemHeightWithGap);
  }

  private calculateNumberOfStacks() {
    // Calculate how many stacks fit horizontally
    // Available width = viewport width - sidebar width (300px) - margins (35px right)
    const availableWidth = window.innerWidth - 300 - 35;
    const stackWidth = 140; // max-width of each stack
    const stackGap = 104; // gap between stacks

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

    // Update the display
    this.updateStacks();

    // Continue animation
    requestAnimationFrame(() => this.momentumAnimation());
  }

  onScroll(event: Event) {
    event.preventDefault();
  }

  private updateStacks() {
    // Calculate base scroll offset using item height with gap
    const itemHeightWithGap = this.itemHeight + this.itemGap;
    const baseOffset = Math.floor(this.scrollPosition / itemHeightWithGap);

    this.stacks.forEach((stack, stackIndex) => {
      stack.items = [];

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
        } else {
          stack.items.push('');
        }
      }
    });
  }

  getItemTransform(index: number, stackIndex: number): string {
    const itemHeightWithGap = this.itemHeight + this.itemGap;
    const fractionalScroll =
      (this.scrollPosition % itemHeightWithGap) / itemHeightWithGap;
    const stack = this.stacks[stackIndex];

    if (stack.direction === 'increasing') {
      // Normal direction - slide up
      return `translateY(${-fractionalScroll * itemHeightWithGap}px)`;
    } else {
      // Reverse direction - slide down
      return `translateY(${fractionalScroll * itemHeightWithGap}px)`;
    }
  }

  getItemTransition(index: number): string {
    return 'none'; // No CSS transitions, JavaScript handles all animation
  }
}
