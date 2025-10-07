import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalDesign } from './digital-design';

describe('DigitalDesign', () => {
  let component: DigitalDesign;
  let fixture: ComponentFixture<DigitalDesign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigitalDesign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigitalDesign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
