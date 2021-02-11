import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectMetamaskComponent } from './connect-metamask.component';

describe('ConnectMetamaskComponent', () => {
  let component: ConnectMetamaskComponent;
  let fixture: ComponentFixture<ConnectMetamaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectMetamaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectMetamaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
