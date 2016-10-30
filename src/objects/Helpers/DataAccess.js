/*
 * DataAccess
 *
 * Interact with long term storage
 */

export default class DataAccess {

  static _getStoredItemName = function(itemName) { //helper to prefix app info to local storage key/pairs so game can be hosted on different websites
    const appName = 'Birdu'; //could use this.game.app/dev Name, but then would require a reference to game
    const devName = 'JTronLabs';

    return appName + '_' + devName + '_' + itemName;
  };

  static getConfig(name) {
    try {
      return JSON.parse(localStorage[DataAccess._getStoredItemName(name)]); //TODO localForage
    } catch (err) {
      return localStorage[DataAccess._getStoredItemName(name)]; //TODO localForage
    }
  }

  static setConfig(name, value) {
    localStorage[DataAccess._getStoredItemName(name)] = JSON.stringify(value); //TODO localForage

    return value;
  }


  static initializeSavedData(game) {
    DataAccess.setConfig('score', DataAccess.getConfig('score') || 0);
    DataAccess.setConfig('level', DataAccess.getConfig('level') || 0);
    DataAccess.setConfig('sprites', DataAccess.getConfig('sprites') || []);

    DataAccess.setConfig('maxScore', DataAccess.getConfig('maxScore') || 0);
    DataAccess.setConfig('maxLevel', DataAccess.getConfig('maxLevel') || 0);

    DataAccess.setConfig('playerFrame', DataAccess.getConfig('playerFrame') || game.animationInfo.defaultPlayerFrame);
    DataAccess.setConfig('unlockedBirdSprites', DataAccess.getConfig('unlockedBirdSprites') || [game.animationInfo.defaultPlayerFrame]);

    const zeroKills = [];
    zeroKills.length = game.animationInfo.maxBirdFrame + 1;
    zeroKills.fill(0);
    DataAccess.setConfig('kills', DataAccess.getConfig('kills') || zeroKills);

    const zeroMedals = [];
    zeroMedals.length = game.integers.medals.max + 1; //zero indexed=+1
    zeroMedals.fill(0);
    DataAccess.setConfig('medals', DataAccess.getConfig('medals') || zeroMedals);

    const settings = DataAccess.setConfig('settings', DataAccess.getConfig('settings') || game.integers.defaultSettings);
    game.sound.volume = Number(!settings.muted);

    this.overrideGameFunctionsToCheckForSettings(game);
  }

  static overrideGameFunctionsToCheckForSettings(game) {
    //override Default functions to take advantage of the Settings
    //Override Phaser's Camera Shake
    const orginialShake = game.camera.shake;
    game.camera.shake = function() {
      if (DataAccess.getConfig('settings').screenShake) orginialShake.bind(this)(...arguments);
    };

    //----- FOR VIBRATE TO WORK SYSTEM VOLUME CANNOT BE MUTED (tested in Android)! -----
    //override Navigator's Vibrate
    const orginialVibrate = navigator.vibrate;
    navigator.vibrate = function() {
      if (DataAccess.getConfig('settings').vibration) {
        orginialVibrate.bind(this)(...arguments);
      }
    };
  }

}
