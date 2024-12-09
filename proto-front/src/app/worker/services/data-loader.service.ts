import {
  Oeuvre,
  OeuvreSource,
  ReferencesData,
  Volume,
} from 'src/app/interfaces/interface';

import KeywordTreeIdbService from './IndexedDb/keyword-tree-idb.service';
import ThemeTreeIdbService from './IndexedDb/theme-tree-idb.service';
import DataManager from './data-manager.service';
import DataService from './data.service';
import DefensiveCodeService from './defensive-code.service';
import FormatService from './format.service';
import { HierarchyService } from './hierarchy.service';
import IndexedDbService from './indexed-db.service';
import IndexedDbUtils from './indexed-db.utils.service';
import KeywordService from './keyword.service';
import MessageService from './message.service';
import Utils from './utils.service';

export default class DataLoaderService {
  constructor(private dm: DataManager) {}

  async loadSettings() {
    const res = await DataService.getSettings();

    if (res.error) {
      const formattedErr = DefensiveCodeService.formatErrors([res.error]);
      postMessage({
        label: 'settingsError',
        data: formattedErr,
      });
      return;
    }

    MessageService.postSettings(res);

    if (res.error || !res.settings) return;

    this.dm.SETTINGS = res.settings;
  }

  async loadConf() {
    const res = await DataService.getConfs();

    if (res.error) {
      const formattedErr = DefensiveCodeService.formatErrors([res.error]);
      postMessage({
        label: 'confError',
        data: formattedErr,
      });
      return;
    }

    MessageService.postOeuvres(FormatService.getOeuvres(res.oeuvres));
  }

  async loadData(pageSize: number) {
    this.dm.PAGESIZE = pageSize;
    DataService.getConfs().then((res) => {
      const oeuvresSource = res.oeuvres;

      if (res.error) {
        const formattedErr = DefensiveCodeService.formatErrors([res.error]);
        postMessage({
          label: 'confError',
          data: formattedErr,
        });
        return;
      }

      this.dm.NBFILES = Utils.getNbFilesToDownload(oeuvresSource || []);

      MessageService.postNbFiles(this.dm.NBFILES);

      deleteNoMoreUsedFilesFromIndexedDb(oeuvresSource || []);

      this.dm.OEUVRES = FormatService.getOeuvres(oeuvresSource);

      // Sort list of oeuvres
      this.dm.OEUVRES = this.dm.OEUVRES.sort(function (a, b) {
        return a.fullName.localeCompare(b.fullName);
      });

      MessageService.postOeuvres(this.dm.OEUVRES);

      Promise.all(
        this.dm.OEUVRES.map((oeuvre: Oeuvre) => {
          if (oeuvre.isParent) {
            if (!oeuvre.volumeList) oeuvre.volumeList = [];
            return Promise.all(
              oeuvre.volumeList.map((volume: Volume) => {
                return this.loadReference(oeuvre, volume.ID).then(
                  (res: any) => {
                    if (res === 'STOP') return res;
                    let _res = FormatService.formatData(
                      res,
                      this.dm.OEUVRES,
                      volume
                    );
                    this.sendFirstKeywordsAndReferences(_res);

                    this.dm.CPTREF += _res.length;
                    MessageService.postCptRef(this.dm.CPTREF);

                    this.dm.NBLOADEDFILES++;
                    MessageService.postNbLoadedFiles(this.dm.NBLOADEDFILES);
                    return _res;
                  }
                );
              })
            ).then((data: any) => data.flat());
          } else {
            return this.loadReference(oeuvre, oeuvre.id || '').then(
              (data: any) => {
                if (data === 'STOP') return data;
                let _res = FormatService.formatData(data, this.dm.OEUVRES);
                this.sendFirstKeywordsAndReferences(_res);

                this.dm.CPTREF += _res.length;
                MessageService.postCptRef(this.dm.CPTREF);

                this.dm.NBLOADEDFILES++;
                MessageService.postNbLoadedFiles(this.dm.NBLOADEDFILES);
                return _res;
              }
            );
          }
        })
      ).then(async (data: any) => {
        let arr: any[] = data.flat();

        if (this.dm.ERRORS.length > 0) {
          const formattedErr = DefensiveCodeService.formatErrors(
            this.dm.ERRORS
          );
          postMessage({
            label: 'refError',
            data: formattedErr,
          });
          return;
        }

        this.dm.REFERENCES = arr;
        this.dm.REF1 = arr;
        this.dm.FILTERED_REFERENCES = arr;

        this.dm.KEYWORDS = KeywordService.get(this.dm.REFERENCES);

        const refs = this.dm.REFERENCES.slice(0, this.dm.PAGESIZE);
        MessageService.postReferences(refs);
        MessageService.postKeywords(this.dm.KEYWORDS, true);

        this.loadThemes();
      });
    });
  }

  private sendFirstKeywordsAndReferences(references: any) {
    // Send first keywords
    if (this.dm.FIRST_KEYWORDS.length < 10) {
      let _kw = KeywordService.extractAllKeywords(references);
      this.dm.FIRST_KEYWORDS = [
        ...new Set([..._kw, ...this.dm.FIRST_KEYWORDS]),
      ];

      if (this.dm.FIRST_KEYWORDS.length >= 10) {
        const kw = this.dm.FIRST_KEYWORDS.map((el, index) => {
          return { value: el, selected: false, index };
        });
        MessageService.postKeywords(kw, false);
      }
    }

    // Send first references
    if (this.dm.REFERENCES.length < this.dm.PAGESIZE) {
      this.dm.REFERENCES = [...this.dm.REFERENCES, ...references];
      if (this.dm.REFERENCES.length >= this.dm.PAGESIZE) {
        const ref = this.dm.REFERENCES.slice(0, this.dm.PAGESIZE);
        MessageService.postReferences(ref);
      }
    }
  }

  private async loadReference(oeuvre: Oeuvre, fileName: string) {
    const { name, version } = IndexedDbUtils.parseFileName(fileName);
    const db: any = await IndexedDbService.getVersion(name);

    // check if present in cache
    if (db?.version === version) {
      // If yes, use cache
      const { data } = await IndexedDbService.getFile(name);
      return data;
    } else {
      return DataService.getReferencesOfOeuvre(fileName).then(
        (res: ReferencesData) => {
          if (res.error) {
            this.dm.ERRORS.push(res.error);
            return 'STOP';
          }

          let references = res.references || [];
          FormatService.prepareData(references, oeuvre);

          // Update or Create
          IndexedDbService.saveFile(name, version, references);
          return references;
        }
      );
    }
  }

  private async loadThemes() {
    const themeTreeVersion = this.dm.SETTINGS['THEMES-VERSION'] || '';
    const keywordTreeVersion = this.dm.SETTINGS['KEYWORDS-VERSION'] || '';

    if (themeTreeVersion && keywordTreeVersion) {
      try {
        const _themesTree = await ThemeTreeIdbService.getData(themeTreeVersion);
        const _keywordsTree = await KeywordTreeIdbService.getData(
          keywordTreeVersion
        );

        // NOT FOUND ERROR
        if (_themesTree?.error?.status === 404) {
          const formattedErr = DefensiveCodeService.formatErrors([
            _themesTree.error,
          ]);
          postMessage({
            label: 'themesTreeNotFoundError',
            data: formattedErr,
          });
          return;
        }

        if (_keywordsTree?.error?.status === 404) {
          const formattedErr = DefensiveCodeService.formatErrors([
            _keywordsTree.error,
          ]);
          postMessage({
            label: 'keywordsTreeNotFoundError',
            data: formattedErr,
          });
          return;
        }

        // INCORRECT FORMAT ERROR
        if (!_keywordsTree.status) {
          postMessage({
            label: 'keywordsTreeError',
            data: {
              name: 'keywords',
              code: _keywordsTree.code,
              data: _keywordsTree.data,
            },
          });
          return;
        }

        if (!_themesTree.status) {
          postMessage({
            label: 'themesTreeError',
            data: {
              name: 'themes',
              code: _themesTree.code,
              data: _themesTree.data,
            },
          });
          return;
        }

        const { avecEnfants, inexistants } =
          HierarchyService.findInvalidKeywordsDetails(
            _keywordsTree.keywords,
            _themesTree.themes
          );

        if (avecEnfants.length > 0 || inexistants.length > 0) {
          IndexedDbService.deleteFiles(['keywordTree', 'themeTree']);
          postMessage({
            label: 'mergeTreeError',
            data: {
              name: 'merge',
              error: { avecEnfants, inexistants },
            },
          });
          return;
        }

        // BUILD PTREE

        this.dm.KEYWORDS_TREE = _keywordsTree.keywords;
        this.dm.THEMES_TREE = _themesTree.themes;

        const _tree = HierarchyService.buildFinalTree(
          this.dm.REFERENCES,
          _keywordsTree.keywords,
          _themesTree.themes
        );

        this.dm.TREE = _tree;
        MessageService.postTree(_tree);

        this.dm.IS_JOB_DONE = true;
        postMessage('JOB DONE');
      } catch (err) {
        console.log('Error when trying to load themeTree and keywordTree');
      }
    } else {
      this.dm.IS_JOB_DONE = true;
      postMessage('JOB DONE');
    }
  }
}

async function deleteNoMoreUsedFilesFromIndexedDb(
  oeuvresSource: OeuvreSource[]
) {
  const dbFilesList = await IndexedDbService.getAll();
  const confFilesList = IndexedDbUtils.getConfFilesList(oeuvresSource);

  const difference = dbFilesList.filter(
    (element: string) =>
      !confFilesList.includes(element) &&
      !['themeTree', 'keywordTree'].includes(element)
  );

  // Delete no more used entry from indexedDb
  if (difference.length > 0) IndexedDbService.deleteFiles(difference);
}
