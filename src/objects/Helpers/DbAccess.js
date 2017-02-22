/*
 * DbAccess
 *
 * Co-opted from https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html
 * With help from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 */

export default class DbAccess {

  static get dbName() {
    return 'Birdu_by_JTronLabs';
  }
  static get dbVersion() {
    return 1;
  }
  static get configObjStoreName() {
    return 'config';
  }
  static get db() {
    return DbAccess._db;
  }

  static open(game, defaultData) {
    return new Promise(function(resolve, reject) {
      var openRequest = window.indexedDB.open(DbAccess.dbName, DbAccess.dbVersion);

      openRequest.onerror = function(event) {
        reject(event.target.errorCode);
      };

      // Database is able to open automatically, no upgrade needed
      openRequest.onsuccess = function(event) {
        DbAccess._db = event.target.result;
        resolve(DbAccess._db);
      };

      // Database must be upgraded
      openRequest.onupgradeneeded = function(event) {
        // This is either a newly created database, or a new version number
        // has been submitted to the open() call.
        DbAccess._db = event.target.result;
        DbAccess._db.onerror = function() {
          reject(DbAccess._db.errorCode);
        };

        var store = DbAccess._db.createObjectStore(DbAccess.configObjStoreName);

        //No indicies currently needed

        // Once the store is created, populate it
        store.transaction.oncomplete = async function(event) {
          DbAccess.initDb(game, defaultData).then(function(value) {
            resolve(DbAccess._db);
          }, function(reason) {
            reject(reason);
          });
        };

        store.transaction.onerror = function(event) {
          reject(event);
        };
      };
    });
  }





  /*
    INTERACT WITH THE 'config' OBJECT KEY STORE
  */

  static getKey(key) {
    return new Promise(function(resolve, reject) {
      let store = DbAccess._db.transaction(DbAccess.configObjStoreName).objectStore(DbAccess.configObjStoreName).get(key);
      store.onsuccess = function(event) {
        resolve(event.target.result);
      };
      store.onerror = function(event) {
        reject(event);
      };
    });
  }

  static setKey(key, value) {
    // The transaction method takes an array of the names of object stores
    // and indexes that will be in the scope of the transaction (or a single
    // string to access a single object store). The transaction will be
    // read-only unless the optional 'readwrite' parameter is specified.
    // It returns a transaction object, which provides an objectStore method
    // to access one of the object stores that are in the scope of this
    // transaction.
    return new Promise(function(resolve, reject) {
      let store = DbAccess._db.transaction(DbAccess.configObjStoreName, 'readwrite').objectStore(DbAccess.configObjStoreName).put(value, key);
      store.onsuccess = function(event) {
        resolve(event.target.result);
      };
      store.onerror = function(event) {
        reject(event);
      };
    });
  }





  /*
    HELPERS FOR THE 'config' OBJECT KEY STORE
  */

  static async initDb(game, defaultData) {
    /*
    //does not load in parallel
    for (let key in defaultData) {
      let save = DbAccess.setKey(key, defaultData[key]);
      await save;
    }
    */

    await Promise.all(Object.keys(defaultData).map(async(key) => {
      return await DbAccess.setKey(key, defaultData[key]);
    }));

    console.log('db initialized');

    return null;
  }

}
