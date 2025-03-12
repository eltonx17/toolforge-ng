import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sha256HashComponent } from './sha256-hash.component';

describe('Sha256HashComponent', () => {
  let component: Sha256HashComponent;
  let fixture: ComponentFixture<Sha256HashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sha256HashComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sha256HashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
