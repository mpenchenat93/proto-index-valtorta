import {
  OeuvreSource,
  ReferenceSource,
  Settings,
} from '../../interfaces/interface';

import DataManager from './data-manager.service';

export default class HttpService {
  static getSettings(): Promise<Settings> {
    const dataManager = DataManager.getInstance();
    const prefixUrl = dataManager.getPrefixUrl();

    const timestamp = new Date().getTime();
    return fetch(`${prefixUrl}settings.json?timestamp=${timestamp}`)
      .then((response) => {
        if (!response.ok) return Promise.reject(response);
        return response.json();
      })
      .then((data: Settings) => data)
      .catch((error) => {
        throw error;
      });
  }

  static getConf(): Promise<OeuvreSource[]> {
    const dataManager = DataManager.getInstance();
    const prefixUrl = dataManager.getPrefixUrl();

    const timestamp = new Date().getTime();
    return fetch(`${prefixUrl}conf.json?timestamp=${timestamp}`)
      .then((response) => {
        if (!response.ok) return Promise.reject(response);
        return response.json();
      })
      .then((data: OeuvreSource[]) => data)
      .catch((error) => {
        throw error;
      });
  }

  static getReferencesOfOeuvre(oeuvreId: string): Promise<ReferenceSource[]> {
    const dataManager = DataManager.getInstance();
    const prefixUrl = dataManager.getPrefixUrl();

    return fetch(`${prefixUrl}${oeuvreId}`)
      .then((response) => {
        if (!response.ok) return Promise.reject(response);
        return response.json();
      })
      .then((data: ReferenceSource[]) => data)
      .catch((error) => {
        throw error;
      });
  }

  static getThemes(code: string): Promise<any[]> {
    const dataManager = DataManager.getInstance();
    const prefixUrl = dataManager.getPrefixUrl();

    return fetch(`${prefixUrl}themes.${code}.json`)
      .then((response) => {
        if (!response.ok) return Promise.reject(response);
        return response.json();
      })
      .then((data: any[]) => data)
      .catch((error) => {
        throw error;
      });
  }

  static getKeywords(code: string): Promise<any[]> {
    const dataManager = DataManager.getInstance();
    const prefixUrl = dataManager.getPrefixUrl();

    return fetch(`${prefixUrl}keywords.${code}.json`)
      .then((response) => {
        if (!response.ok) return Promise.reject(response);
        return response.json();
      })
      .then((data: any[]) => data)
      .catch((error) => {
        throw error;
      });
  }
}
