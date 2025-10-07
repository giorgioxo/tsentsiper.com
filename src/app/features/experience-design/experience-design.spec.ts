import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperienceDesign } from './experience-design';

describe('ExperienceDesign', () => {
  let component: ExperienceDesign;
  let fixture: ComponentFixture<ExperienceDesign>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperienceDesign]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExperienceDesign);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
