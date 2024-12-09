import {
  ErrorIt,
  FileStatus,
  OeuvreSource,
  OeuvresData,
  ReferencesData,
  Settings,
  SettingsData,
  WarningIt,
} from '../../interfaces/interface';

import DataManager from './data-manager.service';
import DefensiveCodeService from './defensive-code.service';
import { EncryptionService } from './encryption.service';
import { HierarchyService } from './hierarchy.service';
import HttpService from './http.service';

export default class DataService {
  static getSettings(): Promise<SettingsData> {
    return HttpService.getSettings()
      .then((settings: Settings) => {
        const res = DefensiveCodeService.getSettingsFileStatus(settings);

        if (typeof settings.EMAIL === 'string') {
          settings.EMAIL = EncryptionService.decrypt(settings.EMAIL);
        }

        let error: ErrorIt | null = null;
        let warning: WarningIt | null = null;
        if (res.requiredProperties.length) {
          error = {
            file: 'settings.json',
            status: 500,
            requiredProperties: res.requiredProperties,
          };
        }

        return {
          settings,
          error,
          warning,
        };
      })
      .catch(catchError);
  }

  static getConfs(): Promise<OeuvresData> {
    return HttpService.getConf()
      .then((oeuvres: OeuvreSource[]) => {
        let res: FileStatus = DefensiveCodeService.getConfFileStatus(oeuvres);

        let error: ErrorIt | null = null;
        let warning: WarningIt | null = null;
        if (res.notExpectedProperties.length) {
          warning = {
            file: 'conf.json',
            status: 502,
            notExpectedProperties: res.notExpectedProperties,
          };
        }
        if (res.requiredProperties.length) {
          error = {
            file: 'conf.json',
            status: 500,
            requiredProperties: res.requiredProperties,
          };
        }

        return {
          oeuvres,
          error,
          warning,
        };
      })
      .catch(catchError);
  }

  static getReferencesOfOeuvre(oeuvreId: string): Promise<ReferencesData> {
    return HttpService.getReferencesOfOeuvre(oeuvreId)
      .then((references: any) => {
        let res = DefensiveCodeService.getReferenceFileStatus(references);
        let error: ErrorIt | null = null;
        let warning: WarningIt | null = null;

        if (res.notExpectedProperties.length) {
          warning = {
            status: 502,
            file: oeuvreId,
            notExpectedProperties: res.notExpectedProperties,
          };
        }
        if (res.requiredProperties.length) {
          error = {
            file: oeuvreId,
            status: 500,
            requiredProperties: res.requiredProperties,
          };
        }

        return {
          references,
          error,
          warning,
        };
      })
      .catch(catchError);
  }

  static getThemes(code: string): any {
    return HttpService.getThemes(code)
      .then((themes: any) => {
        const res = HierarchyService.validateThemeInput(themes);
        return {
          themes,
          status: res.status,
          code: res.code,
          data: res.data,
        };
      })
      .catch(catchError);
  }

  static getKeywords(code: string): any {
    return HttpService.getKeywords(code)
      .then((keywords: any) => {
        const res = HierarchyService.validateKeywordInput(keywords);
        return {
          keywords,
          status: res.status,
          code: res.code,
          data: res.data,
        };
      })
      .catch(catchError);
  }
}

function catchError(err: any) {
  const dm = DataManager.getInstance();
  let urlSeparator = dm.LOCATION.includes('localhost')
    ? '/json/'
    : '/mes_notes/';

  let fileName: string = err.url?.split(urlSeparator)[1] || '';
  if (fileName.includes('conf.json?')) fileName = 'conf.json';
  if (fileName.includes('settings.json?')) fileName = 'settings.json';
  return {
    warning: null,
    error: {
      file: fileName,
      status: 404,
    },
  };
}
