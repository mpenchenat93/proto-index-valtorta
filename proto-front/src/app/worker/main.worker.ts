/// <reference lib="webworker" />

import DataFilterService from './services/data-filter.service';
import DataLoaderService from './services/data-loader.service';
import DataManager from './services/data-manager.service';
import IndexedDbService from './services/indexed-db.service';
import MessageService from './services/message.service';

MessageService.setPostMessageHandler(self.postMessage.bind(self));

const dm = DataManager.getInstance();
const dataLoader = new DataLoaderService(dm);
const dataFilter = new DataFilterService(dm);

addEventListener('message', (event) => {
  const eventType = event.data.msg;
  const location = event.data.location;

  if (location) {
    dm.LOCATION = location;
    if (eventType === 'LOAD_SETTINGS') dataLoader.loadSettings();
    if (eventType === 'LOAD_CONF') dataLoader.loadConf();
    if (eventType === 'LOAD_DATA') {
      const pageSize = event.data.pageSize;

      if (dm.IS_JOB_DONE) {
        resendData(pageSize);
      } else {
        dataLoader.loadData(pageSize);
      }
    }
  }

  if (eventType === 'FILTER') {
    dataFilter.filter(event.data.change, event.data.data);
  }

  if (eventType === 'RESET') dataFilter.reset();
  if (eventType === 'CHANGE_PAGE') onPageChange(event.data.page);
  if (eventType === 'CHANGE_PAGESIZE') onPageSizeChange(event.data.pageSize);

  if (eventType === 'EXPORT') {
    MessageService.postReferencesForExport(dm.FILTERED_REFERENCES);
  }

  if (eventType === 'CLEAR_INDEXED-DB') IndexedDbService.clearAllData();
});

function onPageChange(page: number) {
  const newPage = page;
  if (newPage !== dm.PAGE) {
    dm.PAGE = page;
    const references = dm.FILTERED_REFERENCES.slice(
      (dm.PAGE - 1) * dm.PAGESIZE,
      dm.PAGESIZE * dm.PAGE
    );
    MessageService.postReferences(references);
  }
}

function onPageSizeChange(pageSize: number) {
  const newPageSize = pageSize;
  if (newPageSize !== dm.PAGESIZE) {
    dm.PAGESIZE = newPageSize;
    const references = dm.FILTERED_REFERENCES.slice(0, dm.PAGESIZE);
    MessageService.postReferences(references);
  }
}

function resendData(pageSize: number) {
  dm.PAGE = 1;
  MessageService.postOeuvres(dm.OEUVRES);
  MessageService.postKeywords(dm.KEYWORDS, true);
  MessageService.postCptRef(dm.REFERENCES.length);
  MessageService.postReferences(dm.REFERENCES.slice(0, pageSize));
  MessageService.postTree(dm.TREE);
}
