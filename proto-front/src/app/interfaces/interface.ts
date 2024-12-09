export interface Volume {
  ID: string;
  Nom: string;
}

// ---

export interface OeuvreSource {
  ID: string;
  'LABEL REFERENCE ABR': string;
  'LABEL REFERENCE': string;
  'NOM COMPLET': string;
  'EST PARENT': string;
  AUTEUR: string;
  EDITION: string;
  NOM: string;
  TOMES: Volume[];
}

export interface ReferenceSource {
  REFERENCE: string;
  'MOTS CLES': string;
  DETAIL: string;
  CITATION: string;
  URL: string;
}

// ---

export interface FileStatus {
  notExpectedProperties: string[];
  requiredProperties: string[];
}

// ---

export interface ErrorIt {
  file: string;
  status: number;
  requiredProperties?: string[];
}

export interface WarningIt {
  file: string;
  status: number;
  notExpectedProperties?: string[];
}

export interface FormattedError {
  file: string;
  errors: ErrorIt[];
}

// ---

export interface SettingsData {
  error: ErrorIt | null;
  warning: WarningIt | null;
  settings?: Settings;
}

export interface OeuvresData {
  error: ErrorIt | null;
  warning: WarningIt | null;
  oeuvres?: OeuvreSource[];
}

export interface ReferencesData {
  error: ErrorIt | null;
  warning: WarningIt | null;
  references?: ReferenceSource[];
}

// ---

export interface Oeuvre {
  author?: string; // Opt
  edition?: string; // Opt
  fullName: string;
  id?: string;
  isParent: boolean;
  name: string;
  referenceLabel?: string;
  referenceLabelAbr?: string;
  volumeList?: Volume[]; // Opt
}

export interface Reference {
  detail: string;
  detailHidden: string;
  id: string;
  keywords: string[];
  keywordsHidden: string[];
  oeuvreId: string;
  oeuvreName: string;
  quote: string;
  quoteHidden: string;
  reference: string;
  referenceLabel: string;
  referenceLabelAbr: string;
  useVolumes: boolean;
  volume: string;
  volumeName: string;
  url: string;
  collapsed: boolean;
}

export interface Settings {
  EMAIL: string;
  'URL-SUIVI': string;
  'AFFICHER-TEXTE-SUIVI': string; // Enum "oui", "non"
  'URL-FORM': string;
  LANGUE: string;
  'LANGUE-VERSION': number;
  TITRE: string;
  'LABEL-TAB': string;
  'THEMES-VERSION'?: string;
  'KEYWORDS-VERSION'?: string;
}

// ---

export interface ReferenceMin {
  id: string;
  keywords: string[];
}

// ---

export interface SelectableKeyword {
  value: string;
  selected: boolean;
  index: number;
}

// ---

export interface ValidateHierarchy {
  status: boolean;
  code: string;
  data?: any;
}

export interface Errors {
  inexistants: string[];
  avecEnfants: string[];
}

// ---

export interface FormChange {
  oeuvreChange?: boolean;
  keywordChange?: boolean;
  orModeChange?: boolean;
}

export interface FilterData {
  oeuvre: Oeuvre;
  volume: string;
  reference: string;
  themeKeywords: string[];
  keywords: string[];
  search: string;
  isExclusive: boolean;
}
