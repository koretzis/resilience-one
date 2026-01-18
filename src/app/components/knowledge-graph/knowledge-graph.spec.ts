import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeGraph } from './knowledge-graph';

describe('KnowledgeGraph', () => {
  let component: KnowledgeGraph;
  let fixture: ComponentFixture<KnowledgeGraph>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeGraph]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeGraph);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
