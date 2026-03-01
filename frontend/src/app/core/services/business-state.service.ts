import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BusinessStateService {
  // Emits when a new business is created anywhere in the owner dashboard
  private businessCreated = new Subject<any>();
  businessCreated$ = this.businessCreated.asObservable();

  // Emits when a business is deleted
  private businessDeleted = new Subject<string>();
  businessDeleted$ = this.businessDeleted.asObservable();

  emitBusinessCreated(business: any) {
    this.businessCreated.next(business);
  }

  emitBusinessDeleted(businessId: string) {
    this.businessDeleted.next(businessId);
  }
}
