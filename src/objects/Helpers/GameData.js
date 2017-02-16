/*
 * GameData
 *
 * Access global data in a convenient wrapper
 */
import DbAccess from '../Helpers/DbAccess';

export default class GameData {

  constructor() {
    //variables initialized when loading when the DB asynchronousl in DbAccess.js
  }

  static _init() {
    if (!GameData._inst) {
      GameData._inst = new GameData();
    }
  }
  static clear() {
    GameData._inst = null;
  }

  /*
    Properties
  */
  static get score() {
    GameData._init();
    return GameData._inst._score;
  }
  static set score(val) {
    GameData._init();
    GameData._inst._score = val;
  }

  static get level() {
    GameData._init();
    return GameData._inst._level;
  }
  static set level(val) {
    GameData._init();
    GameData._inst._level = val;
  }

  static get player() {
    GameData._init();
    return GameData._inst._player;
  }
  static set player(val) {
    GameData._init();
    GameData._inst._player = val;
  }

  static get sprites() {
    GameData._init();
    return GameData._inst._sprites;
  }
  static set sprites(val) {
    GameData._init();
    GameData._inst._sprites = val;
    DbAccess.setKey('sprites', val);
  }

  static get comboCount() {
    GameData._init();
    return GameData._inst._comboCount;
  }
  static set comboCount(val) {
    GameData._init();
    GameData._inst._comboCount = val;
  }

  static get serializedPlayerInfo() {
    GameData._init();
    return GameData._inst._serializedPlayerInfo;
  }
  static set serializedPlayerInfo(val) {
    GameData._init();
    GameData._inst._serializedPlayerInfo = val;
    DbAccess.setKey('serializedPlayerInfo', val);
  }

  static get maxScore() {
    GameData._init();
    return GameData._inst._maxScore;
  }
  static set maxScore(val) {
    GameData._init();
    GameData._inst._maxScore = val;
    DbAccess.setKey('maxScore', val);
  }

  static get maxLevel() {
    GameData._init();
    return GameData._inst._maxLevel;
  }
  static set maxLevel(val) {
    GameData._init();
    GameData._inst._maxLevel = val;
    DbAccess.setKey('maxLevel', val);
  }

  static get unlockedBirdSprites() {
    GameData._init();
    return GameData._inst._unlockedBirdSprites;
  }
  static set unlockedBirdSprites(val) {
    GameData._init();
    GameData._inst._unlockedBirdSprites = val;
    DbAccess.setKey('unlockedBirdSprites', val);
  }

  static get kills() {
    GameData._init();
    return GameData._inst._kills;
  }
  static set kills(val) {
    GameData._init();
    GameData._inst._kills = val;
    DbAccess.setKey('kills', val);
  }

  static get medals() {
    GameData._init();
    return GameData._inst._medals;
  }
  static set medals(val) {
    GameData._init();
    GameData._inst._medals = val;
    DbAccess.setKey('medals', val);
  }

  static get settings() {
    GameData._init();
    return GameData._inst._settings;
  }
  static set settings(val) {
    GameData._init();
    GameData._inst._settings = val;
    DbAccess.setKey('settings', val);
  }

  static get playerFrame() {
    GameData._init();
    return GameData._inst._playerFrame;
  }
  static set playerFrame(val) {
    GameData._init();
    GameData._inst._playerFrame = val;
    DbAccess.setKey('playerFrame', val);
  }




  /*
    Data Helpers/Convenience methods that use the static getter/setter wrappers
  */
  static getLockedBirds(game) {
    var allBirdIds = new Set();
    for (let i = 0; i <= game.animationInfo.maxBirdFrame; i++) {
      allBirdIds.add(i);
    }

    var unlockedBirds = new Set(GameData.unlockedBirdSprites);
    var lockedBirds = [...allBirdIds].filter(x => !unlockedBirds.has(x)); //find all bird ids that are not in the unlocked set but ARE in the allBird set

    return lockedBirds;
  }

  static resetGame() {
    GameData.score = 0;
    DbAccess.setKey('score', 0);

    GameData.level = 0;
    DbAccess.setKey('level', 0);

    GameData.comboCount = 0;
    DbAccess.setKey('comboCount', 0);

    GameData.sprites = [];
    GameData.player = null;
  }

  /*
    Math (and other) helpers
  */

  // Returns a random number between min (inclusive) and max (exclusive)
  static floatBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  static scaleMultipler(multiplierData, randomize = true) {
    const level = GameData.level;

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
