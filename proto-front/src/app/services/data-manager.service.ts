import { Injectable } from '@angular/core';

import {
  FormattedError,
  Oeuvre,
  SelectableKeyword,
} from '../interfaces/interface';

@Injectable({
  providedIn: 'root',
})
export class DataManagerService {
  settings: any = null;

  oeuvresList: Oeuvre[] = [];
  keywords: SelectableKeyword[] = [];

  isDataLoaded = false;

  formattedErr: FormattedError[] = [];
}
