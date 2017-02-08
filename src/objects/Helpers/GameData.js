/*
 * GameData
 *
 * Access global data in a convenient wrapper
 */
import DbAccess from '../Helpers/DbAccess';

export default class GameData {

  /*
    Properties
  */
  static get score() {
    return GameData._score;
  }
  static set score(val) {
    GameData._score = val;
  }

  static get level() {
    return GameData._level;
  }
  static set level(val) {
    GameData._level = val;
  }

  static get player() {
    return GameData._player;
  }
  static set player(val) {
    GameData._player = val;
  }

  static get sprites() {
    return GameData._sprites;
  }
  static set sprites(val) {
    GameData._sprites = val;
    DbAccess.setKey('sprites', val);
  }

  static get comboCount() {
    return GameData._comboCount;
  }
  static set comboCount(val) {
    GameData._comboCount = val;
  }

  static get serializedPlayerInfo() {
    return GameData._serializedPlayerInfo;
  }
  static set serializedPlayerInfo(val) {
    GameData._serializedPlayerInfo = val;
    DbAccess.setKey('serializedPlayerInfo', val);
  }

  static get maxScore() {
    return GameData._maxScore;
  }
  static set maxScore(val) {
    GameData._maxScore = val;
    DbAccess.setKey('maxScore', val);
  }

  static get maxLevel() {
    return GameData._maxLevel;
  }
  static set maxLevel(val) {
    GameData._maxLevel = val;
    DbAccess.setKey('maxLevel', val);
  }

  static get unlockedBirdSprites() {
    return GameData._unlockedBirdSprites;
  }
  static set unlockedBirdSprites(val) {
    GameData._unlockedBirdSprites = val;
    DbAccess.setKey('unlockedBirdSprites', val);
  }

  static get kills() {
    return GameData._kills;
  }
  static set kills(val) {
    GameData._kills = val;
    DbAccess.setKey('kills', val);
  }

  static get medals() {
    return GameData._medals;
  }
  static set medals(val) {
    GameData._medals = val;
    DbAccess.setKey('medals', val);
  }

  static get settings() {
    return GameData._settings;
  }
  static set settings(val) {
    GameData._settings = val;
    DbAccess.setKey('settings', val);
  }

  static get playerFrame() {
    return GameData._playerFrame;
  }
  static set playerFrame(val) {
    GameData._playerFrame = val;
    DbAccess.setKey('playerFrame', val);
  }

  /*
    Data Helpers
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
