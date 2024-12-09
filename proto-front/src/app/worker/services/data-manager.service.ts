import {
  Oeuvre,
  Reference,
  SelectableKeyword,
  Settings,
} from 'src/app/interfaces/interface';

export default class DataManager {
  private static instance: DataManager;

  IS_JOB_DONE = false;

  LOCATION: string = '';

  PAGE = 1;
  PAGESIZE = 10;

  NBFILES = 1;
  NBLOADEDFILES = 0;
  CPTREF = 0;

  SETTINGS: Settings;
  OEUVRES: Oeuvre[];
  REFERENCES: Reference[] = [];
  KEYWORDS: SelectableKeyword[];

  FILTERED_REFERENCES: Reference[];

  KEYWORDS_TREE: any;
  THEMES_TREE: any;

  TREE: any;

  FIRST_KEYWORDS: string[] = [];

  ERRORS: any = [];

  REF1: Reference[] = [];

  private constructor() {}

  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  public getPrefixUrl(): string {
    if (this.LOCATION.includes('localhost')) return './assets/json/';
    return '/mes_notes/';
  }
}
