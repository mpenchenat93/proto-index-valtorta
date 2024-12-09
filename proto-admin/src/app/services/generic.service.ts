import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  private _hasValtortaLogo;
  private _copyrightName;

  constructor() {
    const isValtorta = true; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<< IS-VALTORTA

    if (isValtorta) {
      this._hasValtortaLogo = true;
      this._copyrightName = 'IndexValtortaFr';
    } else {
      this._hasValtortaLogo = false;
      this._copyrightName = 'SearchQuoteEngine';
    }
  }

  get copyrightName(): string {
    return this._copyrightName;
  }

  get hasValtortaLogo(): boolean {
    return this._hasValtortaLogo;
  }
}
