// services/message.service.ts

import {
  Oeuvre,
  Reference,
  SelectableKeyword,
  SettingsData,
} from 'src/app/interfaces/interface';

interface Options {
  isComplete?: boolean;
  fromFilter?: boolean;
}

export default class MessageService {
  private static postMessageHandler: (message: any) => void = () => {};

  static setPostMessageHandler(handler: (message: any) => void): void {
    MessageService.postMessageHandler = handler;
  }

  static postMessage(label: string, data: any, options?: Options) {
    let message: any = { label, data };

    if (options && options.isComplete) {
      message.isComplete = options?.isComplete;
    }

    if (options && options.fromFilter) {
      message.fromFilter = options?.fromFilter;
    }

    self.postMessage(message);
  }

  static postOeuvres(oeuvres: Oeuvre[]) {
    this.postMessage('oeuvres', oeuvres);
  }

  static postSettings(settings: SettingsData) {
    this.postMessage('settings', settings);
  }

  static postCptRef(cptRef: number) {
    this.postMessage('cptRef', cptRef);
  }

  static postNbFiles(nbFiles: number) {
    this.postMessage('nbFiles', nbFiles);
  }

  static postNbLoadedFiles(nbLoadedFiles: number) {
    this.postMessage('nbLoadedFiles', nbLoadedFiles);
  }

  static postReferences(references: Reference[], fromFilter = false) {
    this.postMessage('references', references, { fromFilter });
  }

  static postReferencesForExport(references: Reference[]) {
    this.postMessage('referencesForExport', references);
  }

  static postKeywords(keywords: SelectableKeyword[], isComplete?: boolean) {
    this.postMessage('keywords', keywords, { isComplete });
  }

  static postTree(tree: any) {
    this.postMessage('tree', tree);
  }
}
