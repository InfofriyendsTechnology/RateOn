import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

@Component({
  selector: 'app-analytics-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-charts.component.html',
  styleUrl: './analytics-charts.component.scss'
})
export class AnalyticsChartsComponent implements AfterViewInit, OnChanges {
  @Input() type: 'bar' | 'pie' | 'line' | 'doughnut' = 'bar';
  @Input() data!: ChartData;
  @Input() title: string = '';
  @Input() loading: boolean = false;
  @Input() height: string = '300px';
  
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  private chart?: Chart;

  ngAfterViewInit(): void {
    if (!this.loading && this.data) {
      this.renderChart();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.chartCanvas && !this.loading && this.data) {
      this.renderChart();
    }
  }

  private renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.chartCanvas || !this.data) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.type === 'pie' || this.type === 'doughnut',
            position: 'bottom',
          },
          title: {
            display: false
          }
        },
        scales: this.type !== 'pie' && this.type !== 'doughnut' ? {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        } : undefined
      }
    };

    this.chart = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
