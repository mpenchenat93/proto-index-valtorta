import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private dataUpdated = new Subject<string>();

  dataUpdated$ = this.dataUpdated.asObservable();

  emitDataUpdated(dataType: string, newData: string) {
    const payload = JSON.stringify({ dataType, newData });
    this.dataUpdated.next(payload);
  }
}
