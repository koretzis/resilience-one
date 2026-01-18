import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoMap } from './geo-map';

describe('GeoMap', () => {
  let component: GeoMap;
  let fixture: ComponentFixture<GeoMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
