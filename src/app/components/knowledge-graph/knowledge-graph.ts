import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { InfrastructureNode } from '../../models/infrastructure.model';
import { SimulationService } from '../../services/simulation';
import { selectNodes } from '../../store/infrastructure.selectors';

@Component({
  selector: 'app-knowledge-graph',
  standalone: true,
  template: `<div class="graph-container"></div>`,
  styles: [`.graph-container { width: 100%; height: 500px; }`]
})
export class KnowledgeGraphComponent implements OnInit, OnDestroy {
  private svg: any;
  private simulation: any;
  private sub = new Subscription();
  private nodes: any[] = [];
  private links: any[] = [];

  constructor(
    private element: ElementRef,
    private store: Store,
    private simService: SimulationService
  ) {}

  ngOnInit() {
    this.simService.getUpdates().subscribe((data: any) => {
        const readings = data.metrics; // <--- ΠΑΛΙ ΕΔΩ Η ΑΛΛΑΓΗ
        
        if (readings) {
            readings.forEach((r: any) => {
                this.updateNodeVisuals(r.id, r.val, r.type);
            });
        }
    });
}

  private initData(nodes: InfrastructureNode[]) {
    this.nodes = nodes.map(n => ({ ...n })); // Deep copy
    this.links = [];

    // Build links based on 'supplies'
    nodes.forEach(source => {
      if (source.supplies) {
        source.supplies.forEach(targetId => {
          // Check if target exists
          if (nodes.find(n => n.id === targetId)) {
            this.links.push({ source: source.id, target: targetId });
          }
        });
      }
    });
  }

  private createGraph() {
    const element = this.element.nativeElement.querySelector('.graph-container');
    d3.select(element).selectAll('*').remove(); // Clear old graph

    const width = element.offsetWidth;
    const height = 500;

    this.svg = d3.select(element).append('svg')
      .attr('width', width)
      .attr('height', height);

    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = this.svg.append('g')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 2);

    const node = this.svg.append('g')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('r', 20)
      .attr('fill', (d: any) => d.type === 'substation' ? '#3f51b5' : '#f44336')
      .call(d3.drag()
        .on('start', (event: any, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event: any, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event: any, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    node.append('title').text((d: any) => d.name);

    this.simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });
  }

  private updateNodeVisuals(id: string, val: number, type: string) {
    // D3 Update Logic
    this.svg.selectAll('circle')
      .filter((d: any) => d.id === id)
      .transition().duration(500)
      .attr('fill', () => {
        if (type === 'temp' && val > 90) return '#f44336';
        if (type === 'load' && val > 90) return '#ff9800';
        if (type === 'fuel' && val < 20) return '#9c27b0';
        return '#4caf50';
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}