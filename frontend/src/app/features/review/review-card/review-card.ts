import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, ThumbsUp, ThumbsDown, MessageSquare, User } from 'lucide-angular';
import { ReactionService, ToggleReactionResponse } from '../../../core/services/reaction.service';
import { AuthService } from '../../../core/services/auth';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
})
export class ReviewCard implements OnInit, OnChanges {
  /** The review object (userId may be a populated object or an ID string) */
  @Input() review: any;
  /** Pass the user separately when userId in review is not populated */
  @Input() reviewUser: any = null;
  /** Whether to show helpful / reply action buttons */
  @Input() showActions: boolean = true;

  @Output() reactionToggled = new EventEmitter<{ reviewId: string; type: string }>();

  readonly ThumbsUp = ThumbsUp;
  readonly ThumbsDown = ThumbsDown;
  readonly MessageSquare = MessageSquare;
  readonly UserIcon = User;

  avatarFailed = false;
  helpfulCount = 0;
  notHelpfulCount = 0;
  userReaction: 'helpful' | 'not_helpful' | null = null;
  reactionLoading = false;

  // Who found this helpful
  showHelpfulList = false;
  helpfulUsers: any[] = [];
  helpfulUsersLoading = false;

  constructor(
    private router: Router,
    private reactionService: ReactionService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.syncCountsFromReview();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['review']) {
      this.syncCountsFromReview();
    }
  }

  private syncCountsFromReview(): void {
    this.helpfulCount = this.review?.reactions?.helpful ?? this.review?.stats?.helpfulCount ?? 0;
    this.notHelpfulCount = this.review?.reactions?.notHelpful ?? this.review?.stats?.notHelpfulCount ?? 0;
  }

  /** Returns the populated user object (from review.userId or the injected reviewUser) */
  getUser(): any {
    const u = this.review?.userId;
    if (u && typeof u === 'object') return u;
    return this.reviewUser || null;
  }

  /** Returns the user _id string */
  getUserId(): string | null {
    const u = this.review?.userId;
    if (u && typeof u === 'object') return u._id;
    if (typeof u === 'string') return u;
    return this.reviewUser?._id || null;
  }

  getUserName(): string {
    const user = this.getUser();
    if (!user) return 'Unknown User';
    const first = user.profile?.firstName || '';
    const last = user.profile?.lastName || '';
    if (first || last) return `${first} ${last}`.trim();
    return user.username || 'Unknown User';
  }

  getUsername(): string {
    return this.getUser()?.username || '';
  }

  getUserAvatar(): string | null {
    return this.getUser()?.profile?.avatar || null;
  }

  getUserInitial(): string {
    return this.getUserName().charAt(0).toUpperCase();
  }

  getTrustLevel(): number {
    return this.getUser()?.level || 1;
  }

  navigateToUserProfile(event: Event): void {
    event.stopPropagation();
    const userId = this.getUserId();
    if (userId) {
      this.router.navigate(['/user', userId]);
    }
  }

  getStarArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  isStarFilled(star: number): boolean {
    return star <= (this.review?.rating || 0);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  getHelpfulCount(): number {
    return this.helpfulCount;
  }

  getNotHelpfulCount(): number {
    return this.notHelpfulCount;
  }

  getReplyCount(): number {
    return this.review?.replyCount ?? this.review?.stats?.replyCount ?? 0;
  }

  onReaction(type: 'helpful' | 'not_helpful', event: Event): void {
    event.stopPropagation();

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.toast.error('Please log in to react to reviews');
      return;
    }

    if (this.reactionLoading || !this.review?._id) return;

    this.reactionLoading = true;

    this.reactionService.toggleReaction(this.review._id, type).subscribe({
      next: (resp: ToggleReactionResponse) => {
        if (resp.success) {
          this.helpfulCount = resp.data.stats.helpful;
          this.notHelpfulCount = resp.data.stats.notHelpful;
          this.userReaction = resp.data.action === 'removed' ? null : type;
          this.reactionToggled.emit({ reviewId: this.review._id, type });
        }
        this.reactionLoading = false;
      },
      error: (err: any) => {
        this.toast.error(err?.error?.message || 'Failed to react');
        this.reactionLoading = false;
      }
    });
  }

  onAvatarError(): void {
    this.avatarFailed = true;
  }

  toggleHelpfulList(event: Event): void {
    event.stopPropagation();
    if (this.helpfulCount === 0) return;
    this.showHelpfulList = !this.showHelpfulList;
    if (this.showHelpfulList && this.helpfulUsers.length === 0) {
      this.loadHelpfulUsers();
    }
  }

  loadHelpfulUsers(): void {
    if (!this.review?._id) return;
    this.helpfulUsersLoading = true;
    this.reactionService.getReactionsByReview(this.review._id, 'helpful').subscribe({
      next: (resp: any) => {
        const data = resp.data || resp;
        this.helpfulUsers = (data.reactions || []).map((r: any) => r.userId).filter(Boolean);
        this.helpfulUsersLoading = false;
      },
      error: () => { this.helpfulUsersLoading = false; }
    });
  }

  getHelpfulUserName(user: any): string {
    const first = user.profile?.firstName || '';
    const last = user.profile?.lastName || '';
    return (first + ' ' + last).trim() || user.username || 'User';
  }

  getHelpfulUserInitial(user: any): string {
    return this.getHelpfulUserName(user).charAt(0).toUpperCase();
  }

  getHelpfulUserAvatar(user: any): string | null {
    return user.profile?.avatar || null;
  }

  navigateToHelpfulUser(user: any, event: Event): void {
    event.stopPropagation();
    const id = typeof user === 'object' ? user._id : user;
    if (id) this.router.navigate(['/user', id]);
  }

  closeHelpfulList(): void {
    this.showHelpfulList = false;
  }
}
