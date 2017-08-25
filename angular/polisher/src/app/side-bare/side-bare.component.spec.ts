import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBareComponent } from './side-bare.component';

describe('SideBareComponent', () => {
  let component: SideBareComponent;
  let fixture: ComponentFixture<SideBareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideBareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideBareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
