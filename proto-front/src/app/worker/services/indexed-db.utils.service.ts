import { OeuvreSource } from '../../interfaces/interface';

export default class IndexedDbUtils {
  // INPUT  : (ex) maison.wyesz.json
  // OUTPUT : (ex) { name: 'maison', version: 'wyesz' }
  static parseFileName(fileName: string) {
    let parties = fileName.split('.');
    let name = parties[0];
    let version = parties[1];
    return {
      name,
      version,
    };
  }

  static getConfFilesList(oeuvres: OeuvreSource[]): string[] {
    let list = getAllFiles(oeuvres);
    return list.map((el) => {
      let { name } = this.parseFileName(el);
      return name;
    });
  }
}

// INPUT  : OeuvreSource[]
// OUTPUT : Liste des fichiers (fileName[])
function getAllFiles(oeuvres: OeuvreSource[]): string[] {
  const tt = oeuvres.map((oeuvre: OeuvreSource) => {
    const books = oeuvre.TOMES?.map((t) => {
      return {
        fileName: t.ID,
      };
    });
    return {
      fileName: oeuvre.ID,
      books: books,
    };
  });

  let arr: any = [];
  tt.forEach((el: any) => {
    if (el.books) {
      arr = arr.concat(el.books.map((b: any) => b.fileName));
    } else {
      arr.push(el.fileName);
    }
  });
  return arr;
}
