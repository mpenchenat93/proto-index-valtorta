import {
  ErrorIt,
  FileStatus,
  FormattedError,
  OeuvreSource,
  ReferenceSource,
} from '../../interfaces/interface';

export default class DefensiveCodeService {
  static getSettingsFileStatus(settings: any) {
    const columns: string[] = Object.keys(settings);
    const expectedColumns = [
      'EMAIL',
      'URL-SUIVI',
      'AFFICHER-TEXTE-SUIVI',
      'URL-FORM',
      'LANGUE',
      'LANGUE-VERSION',
      'TITRE',
      'LABEL-TAB',
    ];

    let missingProperties = expectedColumns.filter(
      (col) => !columns.includes(col)
    );

    let errors = [];

    // - EMAIL : required si CONTACT-PAGE = "oui"
    // - URL-SUIVI : optionnel
    // - AFFICHER-TEXTE-SUIVI : "oui" ou "non"
    // - URL-FORM : optionnel
    // - LANGUE : length = 2
    // - LANGUE-VERSION : Number
    // - TITRE : optionnel
    // - LABEL-TAB : optionnel

    // Check email
    if (isString(settings.EMAIL) && settings.EMAIL.length === 0) {
      missingProperties.push('EMAIL');
    }

    // Check 'AFFICHER-TEXTE-SUIVI'
    if (isString(settings['AFFICHER-TEXTE-SUIVI'])) {
      settings['AFFICHER-TEXTE-SUIVI'] =
        settings['AFFICHER-TEXTE-SUIVI'].toLowerCase();
      if (
        settings['AFFICHER-TEXTE-SUIVI'] !== 'non' &&
        settings['AFFICHER-TEXTE-SUIVI'] !== 'oui'
      ) {
        errors.push('AFFICHER-TEXTE-SUIVI');
      }
    }

    // Check 'LANGUE'
    if (isString(settings['LANGUE']) && settings['LANGUE'].length !== 2) {
      errors.push('LANGUE');
    }

    // Check 'LANGUE-VERSION'
    if (settings['LANGUE-VERSION'] && !isNumber(settings['LANGUE-VERSION'])) {
      errors.push('LANGUE-VERSION');
    }

    return {
      notExpectedProperties: [],
      requiredProperties: [...new Set(errors.concat(missingProperties))],
    };
  }

  static getConfFileStatus(confs: OeuvreSource[]): FileStatus {
    let arr = [
      'EST PARENT',
      'ID',
      'LABEL REFERENCE ABR',
      'LABEL REFERENCE',
      'NOM COMPLET',
      'NOM',
    ];
    let arr2 = [
      'AUTEUR',
      'EDITION',
      'TOMES',
      'EST PARENT',
      'ID',
      'LABEL REFERENCE ABR',
      'LABEL REFERENCE',
      'NOM COMPLET',
      'NOM',
    ];

    // "Auteur"  --> Opt
    // "Edition" --> Opt

    let notExpectedProperties: string[] = [];
    let requiredProperties: string[] = [];
    confs.forEach((conf: OeuvreSource) => {
      let keys: string[] = Object.keys(conf);
      let minus = keys.filter((n) => !arr2.includes(n));
      let minus2 = arr.filter((n) => !keys.includes(n));
      if (minus.length > 0)
        notExpectedProperties = notExpectedProperties.concat(minus);
      if (minus2.length > 0)
        requiredProperties = requiredProperties.concat(minus2);
    });

    // Remove duplicates
    notExpectedProperties = [...new Set(notExpectedProperties)];
    requiredProperties = [...new Set(requiredProperties)];

    return { notExpectedProperties, requiredProperties };
  }

  static getReferenceFileStatus(referencesObj: any): FileStatus {
    let references: ReferenceSource[] = [];
    Object.keys(referencesObj).forEach((ref: any) => {
      references = references.concat(referencesObj[ref]);
    });

    // "Détail" --> Opt
    // "Citation" --> Opt

    let arr = ['REFERENCE', 'MOTS CLES'];
    let arr2 = ['REFERENCE', 'MOTS CLES', 'DETAIL', 'CITATION', 'URL'];

    let notExpectedProperties: string[] = [];
    let requiredProperties: string[] = [];
    references.forEach((ref: ReferenceSource) => {
      let keys = Object.keys(ref);
      let minus = keys.filter((n) => !arr2.includes(n));
      let minus2 = arr.filter((n) => !keys.includes(n));
      if (minus.length > 0)
        notExpectedProperties = notExpectedProperties.concat(minus);
      if (minus2.length > 0)
        requiredProperties = requiredProperties.concat(minus2);
    });

    // Remove duplicates
    notExpectedProperties = [...new Set(notExpectedProperties)];
    requiredProperties = [...new Set(requiredProperties)];

    return { notExpectedProperties, requiredProperties };
  }

  static formatErrors(errors: ErrorIt[]): FormattedError[] {
    let arr: string[] = [];
    errors.forEach((err: ErrorIt) => {
      arr.push(err.file);
    });
    arr = [...new Set(arr)];

    // ----

    return arr.map((file: string) => {
      return {
        file: file,
        errors: errors.filter((err: ErrorIt) => {
          return err.file === file;
        }),
      };
    });
  }
}

function isString(el: any): boolean {
  return typeof el === 'string';
}

function isNumber(value: string | Number) {
  const number = Number(value);
  return !isNaN(number) && isFinite(number);
}
