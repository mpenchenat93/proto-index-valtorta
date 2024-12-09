import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommunicationService {
  private _communicationSource = new Subject<any>();

  // Observable string streams
  communication$ = this._communicationSource.asObservable();

  // Service message commands
  publierMessage(message: any) {
    this._communicationSource.next(message);
  }
}
