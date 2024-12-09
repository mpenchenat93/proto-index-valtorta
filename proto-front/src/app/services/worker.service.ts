import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterData } from '../interfaces/interface';

@Injectable({
  providedIn: 'root',
})
export class WorkerService {
  private worker!: Worker;
  private workerMessages = new Subject<any>();

  public messages$ = this.workerMessages.asObservable();

  constructor() {
    if (typeof Worker !== 'undefined') {
      this.worker = new Worker(
        new URL('../worker/main.worker.ts', import.meta.url),
        { type: 'module' }
      );
      this.worker.onmessage = ({ data }) => {
        this.workerMessages.next(data);
      };
      this.worker.onerror = (error) => {
        this.workerMessages.error(error);
      };
    } else {
      // Web Workers ne sont pas supportés dans ce navigateur.
      console.error('Web Workers are not supported in this environment.');
    }
  }

  postMessage(message: any) {
    this.worker.postMessage(message);
  }

  loadData(location: string, pageSize: number) {
    this.worker.postMessage({ msg: 'LOAD_DATA', location, pageSize });
  }

  loadSettings(location: string) {
    this.worker.postMessage({ msg: 'LOAD_SETTINGS', location });
  }

  loadConf(location: string) {
    this.worker.postMessage({ msg: 'LOAD_CONF', location });
  }

  clearIndexedDb() {
    this.worker.postMessage({ msg: 'CLEAR_INDEXED-DB' });
  }

  changePage(page: number) {
    this.worker.postMessage({ msg: 'CHANGE_PAGE', page });
  }

  changePageSize(pageSize: number) {
    this.worker.postMessage({ msg: 'CHANGE_PAGESIZE', pageSize });
  }

  exportReferences() {
    this.worker.postMessage({ msg: 'EXPORT' });
  }

  // ---

  applyFilter(
    data: FilterData,
    oeuvreChange: boolean = false,
    keywordChange: boolean = false,
    orModeChange: boolean = false
  ) {
    this.worker.postMessage({
      msg: 'FILTER',
      change: { oeuvreChange, keywordChange, orModeChange },
      data,
    });
  }

  resetFilter() {
    this.worker.postMessage({
      msg: 'RESET',
    });
  }
}
