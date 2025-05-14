import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyperfilComponent } from './myperfil.component';

describe('MyperfilComponent', () => {
  let component: MyperfilComponent;
  let fixture: ComponentFixture<MyperfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyperfilComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyperfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
