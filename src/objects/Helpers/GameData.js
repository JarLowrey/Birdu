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

  _defineDefaultData() {
    const defaults = this.game.cache.getJSON('preloadJSON').defaults;

    this.play = {
      score: 0,
      level: 0,
      scoreBuffer: 0,
      comboCount: 0,
      player: null
    };

    this.savedGame = {
      sprites: [],
      player: null,
      score: 0,
      level: 0,
      comboCount: 0
    };

    this._stats = {
      unlockedBirdSprites: [defaults.playerFrame],
      kills: new Array(defaults.maxBirdFrame + 1).fill(0),
      medals: new Array(defaults.medals.max + 1).fill(0),
      playerFrame: defaults.playerFrame,
      bests: {
        level: 0,
        score: 0
      }
    };

    this._settings = {
      vibration: true,
      screenShake: true,
      muted: false
    };

  }

  //auto update long-term storage for certain properties
  get settings() {
    return this._settings;
  }
  set settings(val) {
    this._settings = val;
    DbAccess.setKey('settings', this._settings);
  }
  get stats() {
    return this._stats;
  }
  set stats(val) {
    this._stats = val;
    DbAccess.setKey('stats', this._stats);
  }


  resetGame() {
    this.savedGame.player = null;
    this.savedGame.sprites = [];
    this.savedGame.comboCount = 0;
    this.savedGame.level = 0;
    this.savedGame.score = 0;
    DbAccess.setKey('savedGame', this.savedGame);

    this.play.player = null;
    this.play.score = 0;
    this.play.level = 0;
    this.play.comboCount = 0;
    this.play.scoreBuffer = 0;
  }

  saveGame() {
    //auto-save in Db storage
    this.savedGame.player = this.player.serialize();
    this.savedGame.sprites = this.game.spritePools.serialize();
    this.savedGame.comboCount = this.play.comboCount;
    this.savedGame.level = this.play.level;
    this.savedGame.score = this.play.score + this.play.scoreBuffer;
    this.play.scoreBuffer = 0;
    DbAccess.setKey('savedGame', this.savedGame);
  }

  async load() {
    await DbAccess.open(this.game, {
      'stats': this._stats,
      'savedGame': this.savedGame,
      'settings': this._settings
    });

    //load long term info
    let savedGame = DbAccess.getKey('savedGame');
    let stats = DbAccess.getKey('stats');
    let settings = DbAccess.getKey('settings');

    //load long-term storage into cache
    this.savedGame = await savedGame;
    this._stats = await stats;
    this._settings = await settings;
  }
  /*
    Data Helpers/Convenience methods that use the static getter/setter wrappers
  */
  getLockedBirds(game) {
    var allBirdIds = new Set();
    for (let i = 0; i <= game.animationInfo.maxBirdFrame; i++) {
      allBirdIds.add(i);
    }

    var unlockedBirds = new Set(this._stats.unlockedBirdSprites);
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
