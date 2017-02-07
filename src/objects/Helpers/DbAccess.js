/*
 * DbAccess
 *
 * Co-opted from https://cordova.apache.org/docs/en/latest/cordova/storage/storage.html
 * With help from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
 */
import DataAccess from '../Helpers/DataAccess';

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
    let score = DbAccess.getConfig('score');
    let level = DbAccess.getConfig('level');
    let sprites = DbAccess.getConfig('sprites');
    let comboCount = DbAccess.getConfig('comboCount');

    //long term stats
    let maxScore = DbAccess.getConfig('maxScore');
    let maxLevel = DbAccess.getConfig('maxLevel');
    let playerFrame = DbAccess.getConfig('playerFrame');
    let unlockedBirdSprites = DbAccess.getConfig('unlockedBirdSprites');
    let kills = DbAccess.getConfig('kills');
    let medals = DbAccess.getConfig('medals');
    let config = DbAccess.getConfig('settings');

    //load long-term storage into localStorage cache
    DataAccess.setCached('score', await score);
    DataAccess.setCached('level', await level);
    DataAccess.setCached('sprites', await sprites);
    DataAccess.setCached('comboCount', await comboCount);
    DataAccess.setCached('maxScore', await maxScore);
    DataAccess.setCached('maxLevel', await maxLevel);
    DataAccess.setCached('playerFrame', await playerFrame);
    DataAccess.setCached('unlockedBirdSprites', await unlockedBirdSprites);
    DataAccess.setCached('kills', await kills);
    DataAccess.setCached('medals', await medals);
    DataAccess.setCached('settings', await config);
  }

  static async resetGame() {
    let score = DbAccess.setConfig('score', 0);
    let level = DbAccess.setConfig('level', 0);
    let sprites = DbAccess.setConfig('sprites', []);
    let comboCount = DbAccess.setConfig('comboCount', 0);
    let player = DbAccess.setConfig('player', null);

    await score;
    await level;
    await sprites;
    await comboCount;
    await player;

    return null;
  }

  static async initDb(game) {
    let resetGame = DbAccess.resetGame();

    let maxScore = DbAccess.setConfig('maxScore', 0);
    let maxLevel = DbAccess.setConfig('maxLevel', 0);
    let playerFrame = DbAccess.setConfig('playerFrame', game.animationInfo.defaultPlayerFrame);
    let unlockedBirdSprites = DbAccess.setConfig('unlockedBirdSprites', [game.animationInfo.defaultPlayerFrame]);

    const zeroKills = [];
    zeroKills.length = game.animationInfo.maxBirdFrame + 1;
    zeroKills.fill(0);
    let kills = DbAccess.setConfig('kills', zeroKills);

    const zeroMedals = [];
    zeroMedals.length = game.integers.medals.max + 1; //zero indexed=+1
    zeroMedals.fill(0);
    let medals = DbAccess.setConfig('medals', zeroMedals);

    let config = DbAccess.setConfig('settings', game.integers.defaultSettings);
    game.sound.volume = Number(!game.integers.defaultSettings.muted);

    await resetGame;

    await maxScore;
    await maxLevel;
    await playerFrame;
    await unlockedBirdSprites;
    await kills;
    await medals;
    await config;

    return null;
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
