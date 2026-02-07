import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronRight, Home } from 'lucide-angular';

export interface Crumb {
  label: string;
  link?: string;
  icon?: any;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './breadcrumbs.html',
  styleUrl: './breadcrumbs.scss'
})
export class BreadcrumbsComponent {
  readonly ChevronRight = ChevronRight;
  readonly Home = Home;

  @Input() crumbs: Crumb[] = [];
}
