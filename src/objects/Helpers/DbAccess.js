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

  static open(game) {

    var openRequest = window.indexedDB.open(DbAccess.dbName, DbAccess.dbVersion);
    openRequest.onerror = function(event) {
      console.log(event.target.errorCode);
    };
    // Database is able to open automatically, no upgrade needed
    openRequest.onsuccess = function(event) {
      DbAccess._db = event.target.result;
    };
    // Database must be upgraded
    openRequest.onupgradeneeded = DbAccess.upgrade(game);
  }


  static upgrade(game) {
    return function(event) {
      // This is either a newly created database, or a new version number
      // has been submitted to the open() call.
      DbAccess._db = event.target.result;
      DbAccess._db.onerror = function() {
        console.log(DbAccess._db.errorCode);
      };

      // Create an object store and indexes. A key is a data value used to organize
      // and retrieve values in the object store.
      // Second param is an object with 'autoIncrement' and/or 'keyPath' keys.
      // The keyPath option must be a unique property on every JS object (if defined, can only store JS objects).
      // autoIncrement param generates a key automatically for each new obj stored
      // If neither are defined you must manually set keys to store/retrieve values
      var store = DbAccess._db.createObjectStore(DbAccess.configObjStoreName);

      // Define the indexes we want to use. Objects we add to the store don't need
      // to contain these properties, but they will only appear in the specified
      // index of they do.
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/createIndex
      // syntax: store.createIndex(indexName, keyPath[, parameters]);

      //No indicies currently needed

      // Once the store is created, populate it
      store.transaction.oncomplete = async function(event) {
        DbAccess.initSave(game);
      };
      store.transaction.onerror = function(event) {
        console.log(event);
      };
    }
  }





  /*
    INTERACT WITH THE 'config' OBJECT KEY STORE
  */

  static getConfig(key) {
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

  static setConfig(key, value) {
    // The transaction method takes an array of the names of object stores
    // and indexes that will be in the scope of the transaction (or a single
    // string to access a single object store). The transaction will be
    // read-only unless the optional 'readwrite' parameter is specified.
    // It returns a transaction object, which provides an objectStore method
    // to access one of the object stores that are in the scope of this
    // transaction.
    return new Promise(function(resolve, reject) {
      let store = DbAccess._db.transaction(DbAccess.configObjStoreName, 'readwrite').objectStore(DbAccess.configObjStoreName).add(value, key);
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
  static resetGame() {
    DbAccess.setConfig('score', 0);
    DbAccess.setConfig('level', 0);
    DbAccess.setConfig('sprites', []);
    DbAccess.setConfig('comboCount', 0);
  }

  static initSave(game) {
    DbAccess.resetGame();

    DbAccess.setConfig('maxScore', 0);
    DbAccess.setConfig('maxLevel', 0);
    DbAccess.setConfig('playerFrame', game.animationInfo.defaultPlayerFrame);
    DbAccess.setConfig('unlockedBirdSprites', [game.animationInfo.defaultPlayerFrame]);

    const zeroKills = [];
    zeroKills.length = game.animationInfo.maxBirdFrame + 1;
    zeroKills.fill(0);
    DbAccess.setConfig('kills', zeroKills);

    const zeroMedals = [];
    zeroMedals.length = game.integers.medals.max + 1; //zero indexed=+1
    zeroMedals.fill(0);
    DbAccess.setConfig('medals', zeroMedals);

    DbAccess.setConfig('config', game.integers.defaultSettings);
    game.sound.volume = Number(!game.integers.defaultSettings.muted);
  }

  static getLockedBirds(game) {
    var allBirdIds = new Set();
    for (let i = 0; i <= game.animationInfo.maxBirdFrame; i++) {
      allBirdIds.add(i);
    }

    var unlockedBirds = new Set(DbAccess.getConfig('unlockedBirdSprites'));
    var lockedBirds = [...allBirdIds].filter(x => !unlockedBirds.has(x)); //find all bird ids that are not in the unlocked set but ARE in the allBird set

    return lockedBirds;
  }

}
