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

  private getThemeColors(): { textColor: string; gridColor: string } {
    const isLight = typeof document !== 'undefined' &&
      document.body.classList.contains('light-theme');
    return {
      textColor: isLight ? '#666666' : '#a1a1a1',
      gridColor: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
    };
  }

  private renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    if (!this.chartCanvas || !this.data) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const { textColor, gridColor } = this.getThemeColors();
    const isPolar = this.type === 'pie' || this.type === 'doughnut';

    const config: ChartConfiguration = {
      type: this.type,
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: isPolar,
            position: 'bottom',
            labels: { color: textColor, padding: 16, font: { size: 12 } }
          },
          title: { display: false }
        },
        scales: !isPolar ? {
          y: {
            beginAtZero: true,
            ticks: { precision: 0, color: textColor },
            grid:  { color: gridColor }
          },
          x: {
            ticks: { color: textColor },
            grid:  { color: gridColor }
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
