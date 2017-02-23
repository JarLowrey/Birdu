/*
 * GameData
 *
 * Access global data in a convenient wrapper
 */
import DbAccess from '../Helpers/DbAccess';

export default class GameData {

  constructor(game) {
    this.game = game;

    this._defineDefaultData();
  }

  _applySettings() {
    this.game.sound.volume = Number(!this.game.data.settings.muted); //apply volume settings
  }

  _defineDefaultData() {
    const defaults = this.game.cache.getJSON('preloadJSON').defaults;

    this._resetPlayData();

    this.stats = {
      unlockedBirdSprites: [defaults.playerFrame],
      kills: new Array(defaults.maxBirdFrame + 1).fill(0),
      medals: new Array(defaults.medals.max + 1).fill(0),
      bests: {
        level: 0,
        score: 0
      }
    };

    this.settings = {
      playerFrame: defaults.playerFrame,
      vibration: defaults.settings.vibration,
      screenShake: defaults.settings.screenShake,
      muted: defaults.settings.muted
    };
  }

  _resetPlayData() {
    this.play = {
      score: 0,
      level: 0,
      comboCount: 0,
      player: null,

      serializedObjects: {
        player: null,
        sprites: []
      }
    };
  }

  //auto update long-term storage for certain properties
  saveStats() {
    DbAccess.setKey('stats', this.stats);
  }
  saveSettings() {
    DbAccess.setKey('settings', this.settings);
    this._applySettings();
  }

  resetGame() {
    this._resetPlayData();
    DbAccess.setKey('savedGame', this.play);
  }

  saveGame() {
    //auto-save in Db storage
    this.play.serializedObjects.player = this.play.player.serialize();
    this.play.serializedObjects.sprites = this.game.spritePools.serialize();

    //copy play data to a temp array and remove pointers to sprites (otherwise it crashes)
    let save = {};
    Object.assign(save, this.play);
    save.player = null;

    DbAccess.setKey('savedGame', save);
  }

  async load() {
    await DbAccess.open(this.game, {
      'stats': this.stats,
      'savedGame': this.play,
      'settings': this.settings
    });

    //load long term info
    let savedGame = DbAccess.getKey('savedGame');
    let stats = DbAccess.getKey('stats');
    let settings = DbAccess.getKey('settings');

    //load long-term storage into cache
    this.play = await savedGame;
    this.stats = await stats;
    this.settings = await settings;

    this._applySettings();
  }
  /*
    Data Helpers/Convenience methods that use the static getter/setter wrappers
  */
  getLockedBirds(game) {
    var allBirdIds = new Set();
    for (let i = 0; i <= game.animationInfo.maxBirdFrame; i++) {
      allBirdIds.add(i);
    }

    var unlockedBirds = new Set(this.stats.unlockedBirdSprites);
    var lockedBirds = [...allBirdIds].filter(x => !unlockedBirds.has(x)); //find all bird ids that are not in the unlocked set but ARE in the allBird set

    return lockedBirds;
  }

  /*
    Math (and other) helpers
  */

  // Returns a random number between min (inclusive) and max (exclusive)
  static floatBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  static scaleMultipler(multiplierData, level, randomize = true) {
    const linearScaled = Phaser.Math.linear(multiplierData.min, multiplierData.max, level / multiplierData.maxLevel);
    var delta = Math.min(linearScaled, multiplierData.max) - multiplierData.min;
    if (randomize) {
      delta *= Math.random();
    }
    var returnValue = delta + multiplierData.min;

    if (typeof multiplierData.round !== 'undefined') {
      returnValue = GameData.roundToNearest(returnValue, multiplierData.round.nearest);
    }

    return returnValue;
  }

  static roundToNearest(input, nearest) {
    return Math.round(input / nearest) * nearest;
  }
}
