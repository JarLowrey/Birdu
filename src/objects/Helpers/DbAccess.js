/*
 * DbAccess
 *
 * Co-opted from https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html
 * With help from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 */
import GameData from '../Helpers/GameData';

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
          DbAccess.initDb(game).then(function(value) {
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
  static async loadGame(game) {
    await DbAccess.open(game);

    //level stuff
    let score = DbAccess.getKey('score');
    let level = DbAccess.getKey('level');
    let sprites = DbAccess.getKey('sprites');
    let comboCount = DbAccess.getKey('comboCount');
    let serializedPlayerInfo = DbAccess.getKey('serializedPlayerInfo');

    //long term stats
    let maxScore = DbAccess.getKey('maxScore');
    let maxLevel = DbAccess.getKey('maxLevel');
    let playerFrame = DbAccess.getKey('playerFrame');
    let unlockedBirdSprites = DbAccess.getKey('unlockedBirdSprites');
    let kills = DbAccess.getKey('kills');
    let medals = DbAccess.getKey('medals');
    let settings = DbAccess.getKey('settings');

    //load long-term storage into cache
    GameData.score = await score;
    GameData.level = await level;
    GameData.sprites = await sprites;
    GameData.comboCount = await comboCount;
    GameData.serializedPlayerInfo = await serializedPlayerInfo;
    GameData.maxScore = await maxScore;
    GameData.maxLevel = await maxLevel;
    GameData.playerFrame = await playerFrame;
    GameData.unlockedBirdSprites = await unlockedBirdSprites;
    GameData.kills = await kills;
    GameData.medals = await medals;
    GameData.settings = await settings;
  }

  static async initDb(game) {
    const defaults = game.cache.getJSON('preloadJSON').defaults;

    let score = DbAccess.setKey('score', 0);
    let level = DbAccess.setKey('level', 0);
    let sprites = DbAccess.setKey('sprites', []);
    let comboCount = DbAccess.setKey('comboCount', 0);
    let serializedPlayerInfo = DbAccess.setKey('serializedPlayerInfo', null);

    let maxScore = DbAccess.setKey('maxScore', 0);
    let maxLevel = DbAccess.setKey('maxLevel', 0);
    let playerFrame = DbAccess.setKey('playerFrame', defaults.playerFrame);
    let unlockedBirdSprites = DbAccess.setKey('unlockedBirdSprites', [defaults.playerFrame]);

    const zeroKills = [];
    zeroKills.length = defaults.maxBirdFrame + 1;
    zeroKills.fill(0);
    let kills = DbAccess.setKey('kills', zeroKills);

    const zeroMedals = [];
    zeroMedals.length = defaults.medals.max + 1; //zero indexed=+1
    zeroMedals.fill(0);
    let medals = DbAccess.setKey('medals', zeroMedals);

    let settings = DbAccess.setKey('settings', defaults.settings);
    game.sound.volume = Number(!defaults.settings.muted);

    await score;
    await level;
    await sprites;
    await comboCount;
    await serializedPlayerInfo;

    await maxScore;
    await maxLevel;
    await playerFrame;
    await unlockedBirdSprites;
    await kills;
    await medals;
    await settings;

    console.log('db initialized');

    return null;
  }

}
