import DataService from '../data.service';
import IndexedDbService from '../indexed-db.service';

export default class KeywordTreeIdbService {
  static async getData(version: string) {
    try {
      const db: any = await IndexedDbService.getVersion('keywordTree');
      if (db?.version === version) {
        const file = await IndexedDbService.getFile('keywordTree');
        return file?.data;
      } else {
        const res = await DataService.getKeywords(version);
        if (res.status) {
          IndexedDbService.saveFile('keywordTree', version, res);
        }
        return res;
      }
    } catch (err) {
      console.log('ERROR when trying to retrieve keywordTree');
      return [];
    }
  }
}
