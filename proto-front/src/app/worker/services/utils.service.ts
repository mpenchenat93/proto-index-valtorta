import { OeuvreSource } from '../../interfaces/interface';

export default class Utils {
  /**
   * ProgressBar
   * @param oeuvres OeuvreSource[]
   * @returns number
   */
  static getNbFilesToDownload(oeuvres: OeuvreSource[]): number {
    let cpt = 0;
    for (let i = 0; i < oeuvres.length; i++) {
      if (oeuvres[i]['EST PARENT'] !== 'Oui') cpt++;
      else cpt += oeuvres[i].TOMES.length;
    }

    return cpt;
  }
}
