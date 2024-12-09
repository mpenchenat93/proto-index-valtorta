import DataService from '../data.service';
import IndexedDbService from '../indexed-db.service';

export default class ThemeTreeIdbService {
  static async getData(version: string) {
    try {
      const db: any = await IndexedDbService.getVersion('themeTree');
      if (db?.version === version) {
        const file = await IndexedDbService.getFile('themeTree');
        return file?.data;
      } else {
        const _themes = await DataService.getThemes(version);
        IndexedDbService.saveFile('themeTree', version, _themes);
        return _themes;
      }
    } catch (err) {
      console.log('ERROR when trying to retrieve themeTree');
      return [];
    }
  }
}
