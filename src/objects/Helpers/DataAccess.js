/*
 * DataAccess
 *
 * Interact with long term storage
 */
import DbAccess from '../Helpers/DbAccess';

export default class DataAccess {

  static _getStoredItemName(itemName) { //helper to prefix app info to local storage key/pairs so game can be hosted on different websites
    const appName = 'Birdu'; //could use this.game.app/dev Name, but then would require a reference to game
    const devName = 'JTronLabs';

    return appName + '_' + devName + '_' + itemName;
  }

  static getCached(name) {
    try {
      return JSON.parse(localStorage[DataAccess._getStoredItemName(name)]); //TODO localForage
    } catch (err) {
      return localStorage[DataAccess._getStoredItemName(name)]; //TODO localForage
    }
  }

  static setCached(name, value) {
    localStorage[DataAccess._getStoredItemName(name)] = JSON.stringify(value); //TODO localForage

    return value;
  }

  static getLockedBirds(game) {
    var allBirdIds = new Set();
    for (let i = 0; i <= game.animationInfo.maxBirdFrame; i++) {
      allBirdIds.add(i);
    }

    var unlockedBirds = new Set(DataAccess.getCached('unlockedBirdSprites'));
    var lockedBirds = [...allBirdIds].filter(x => !unlockedBirds.has(x)); //find all bird ids that are not in the unlocked set but ARE in the allBird set

    return lockedBirds;
  }

  static resetGame() {
    DataAccess.setCached('score', 0);
    DataAccess.setCached('level', 0);
    DataAccess.setCached('sprites', []);
    DataAccess.setCached('comboCount', 0);
    DataAccess.setCached('player', null);

    DbAccess.resetGame();
  }

}
