const DB_NAME = 'SearchQuoteEngine';
const DB_VERSION = 1;
const FILE_STORE = 'fileStorage';
const VERSION_STORE = 'versionStorage';

export default class IndexedDbService {
  // Save data and version
  static async saveFile(name: string, version: string, data: any) {
    await updateDB(FILE_STORE, { name: name, data: data })
      .then((_) => {
        return updateDB(VERSION_STORE, { name: name, version: version });
      })
      .then(() => {
        console.log(`saveFile ${name} enregistré avec succès!`);
      })
      .catch((error) => console.log(`saveFile ${name} : `, error));
  }

  // get data
  static getFile(name: string): any {
    return getByKey(FILE_STORE, name);
  }

  // Get all versions
  static async getAll() {
    return await _getAll(VERSION_STORE).then((data: any) =>
      data.map((el: any) => el.name as string)
    );
  }

  // Get version by name
  static getVersion(name: string) {
    return getByKey(VERSION_STORE, name);
  }

  // Delete data and versions by names
  static deleteFiles(names: string[]) {
    deleteByKey(VERSION_STORE, names);
    deleteByKey(FILE_STORE, names);
  }

  // Delete all data and versions
  static clearAllData() {
    openDB().then((db: any) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(
          [FILE_STORE, VERSION_STORE],
          'readwrite'
        );
        transaction.oncomplete = () => resolve(1);
        transaction.onerror = (event: any) =>
          reject('Clear all data error: ' + event.target.errorCode);

        const fileStore = transaction.objectStore(FILE_STORE);
        const versionStore = transaction.objectStore(VERSION_STORE);
        fileStore.clear();
        versionStore.clear();
      });
    });
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (event: any) =>
      reject('Database error: ' + event.target.errorCode);
    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(FILE_STORE)) {
        db.createObjectStore(FILE_STORE, { keyPath: 'name' });
      }
      if (!db.objectStoreNames.contains(VERSION_STORE)) {
        db.createObjectStore(VERSION_STORE, { keyPath: 'name' });
      }
    };
  });
}

async function updateDB(storeName: string, value: any) {
  return openDB().then((db: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      transaction.oncomplete = () => resolve(1);
      transaction.onerror = (event: any) =>
        reject('Transaction error: ' + event.target.errorCode);

      const store = transaction.objectStore(storeName);
      store.put(value);
    });
  });
}

function getByKey(storeName: string, key: any) {
  return openDB().then((db: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event: any) =>
        reject('Get error: ' + event.target.errorCode);
    });
  });
}

async function _getAll(storeName: any) {
  return openDB().then((db: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (event: any) =>
        reject('Get all error: ' + event.target.errorCode);
    });
  });
}

async function deleteByKey(storeName: any, keys: string[]) {
  return openDB().then((db: any) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      transaction.oncomplete = () => resolve(1);
      transaction.onerror = (event: any) =>
        reject('Delete error: ' + event.target.errorCode);

      const store = transaction.objectStore(storeName);
      keys.forEach((key) => {
        store.delete(key);
      });
    });
  });
}
