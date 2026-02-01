import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User, Building2, Star, Award, Search, MessageCircle, Check, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  // Lucide Icons
  readonly User = User;
  readonly Building2 = Building2;
  readonly Star = Star;
  readonly Award = Award;
  readonly Search = Search;
  readonly MessageCircle = MessageCircle;
  readonly Check = Check;
  readonly UserPlus = UserPlus;
  
  currentYear = new Date().getFullYear();
}
