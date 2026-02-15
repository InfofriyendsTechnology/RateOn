import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private promptEvent: BeforeInstallPromptEvent | null = null;
  private canInstall$ = new BehaviorSubject<boolean>(false);
  private isInstalled$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkIfInstalled();
    this.listenForInstallPrompt();
  }

  /**
   * Check if app is already installed
   */
  private checkIfInstalled(): void {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled$.next(true);
    }
  }

  /**
   * Listen for beforeinstallprompt event
   */
  private listenForInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.promptEvent = e as BeforeInstallPromptEvent;
      this.canInstall$.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled$.next(true);
      this.canInstall$.next(false);
    });
  }

  /**
   * Show install prompt to user
   */
  async promptInstall(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    try {
      await this.promptEvent.prompt();
      const { outcome } = await this.promptEvent.userChoice;
      
      if (outcome === 'accepted') {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      this.promptEvent = null;
      this.canInstall$.next(false);
    }
  }

  /**
   * Check if app can be installed
   */
  get canInstall() {
    return this.canInstall$.asObservable();
  }

  /**
   * Check if app is installed
   */
  get isInstalled() {
    return this.isInstalled$.asObservable();
  }

  /**
   * Check if running as PWA
   */
  isRunningAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }
}
