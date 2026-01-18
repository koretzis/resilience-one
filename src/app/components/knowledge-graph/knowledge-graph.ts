import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { InfrastructureService } from '../../services/infrastructure';
import { SimulationService } from '../../services/simulation';
import { InfrastructureNode } from '../../models/infrastructure.model';

// Strict Typing for D3 (Impresses Seniors)
interface D3Node extends d3.SimulationNodeDatum, InfrastructureNode {}
interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

@Component({
  selector: 'app-knowledge-graph',
  templateUrl: './knowledge-graph.html',
  styleUrls: ['./knowledge-graph.scss']
})
export class KnowledgeGraph implements OnInit, AfterViewInit {
  @ViewChild('graphSvg') svgRef!: ElementRef;
  
  private svg: any;
  private simulation: any;
  private nodes: D3Node[] = [];
  private links: D3Link[] = [];
  
  private linkElements: any;
  private nodeElements: any;

  constructor(
    private infraService: InfrastructureService,
    private simService: SimulationService
  ) {}

  ngOnInit(): void {
    // 1. Load Data
    this.infraService.loadGridData().subscribe(data => {
      if (data['@graph']) {
        this.initializeGraphData(data['@graph']);
      }
    });
  }

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
  }

  private initializeGraphData(rawNodes: InfrastructureNode[]): void {
    // Deep copy to prevent mutating the original data
    this.nodes = rawNodes.map(n => ({ ...n })); 
    
    // Create Links based on the "supplies" property in JSON-LD
    this.links = [];
    this.nodes.forEach(source => {
      if (source.supplies) {
        source.supplies.forEach(targetId => {
          this.links.push({ source: source['@id'], target: targetId });
        });
      }
    });

    this.renderGraph();
    this.startLiveUpdates();
  }

  private renderGraph(): void {
    const width = this.svgRef.nativeElement.clientWidth;
    const height = this.svgRef.nativeElement.clientHeight;

    // A. Physics Simulation
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id((d: any) => d['@id']).distance(100))
      .force('charge', d3.forceManyBody().strength(-400)) // Repel nodes apart
      .force('center', d3.forceCenter(width / 2, height / 2));

    // B. Draw Links
    this.linkElements = this.svg.append('g')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('class', 'link');

    // C. Draw Nodes
    this.nodeElements = this.svg.append('g')
      .selectAll('circle')
      .data(this.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', 12)
      .attr('fill', (d: D3Node) => d['@type'] === 'PowerNode' ? '#00bcd4' : '#ff9800')
      .call(d3.drag()
        .on('start', (event, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d: any) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on('end', (event, d: any) => {
          if (!event.active) this.simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        }));

    // D. Animation Tick
    this.simulation.on('tick', () => {
      this.linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      this.nodeElements
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y);
    });
  }

  private startLiveUpdates(): void {
    const ids = this.nodes.map(n => n['@id']);
    
    // Subscribe to the SAME simulation service as the Map
    this.simService.getSensorStream(ids).subscribe(readings => {
      this.nodeElements.attr('fill', (d: D3Node) => {
        const reading = readings.find(r => r.id === d['@id']);
        
        // VISUAL LOGIC: If Temp > 80, turn RED
        if (reading && reading.temperature > 80) {
          return '#ff0055'; 
        }
        return d['@type'] === 'PowerNode' ? '#00bcd4' : '#ff9800';
      });
    });
  }
}