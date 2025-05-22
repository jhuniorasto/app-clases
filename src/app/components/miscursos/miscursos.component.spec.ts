import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiscursosComponent } from './miscursos.component';

describe('MiscursosComponent', () => {
  let component: MiscursosComponent;
  let fixture: ComponentFixture<MiscursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiscursosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiscursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
