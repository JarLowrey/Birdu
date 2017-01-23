/*
 * Gameover state
 *
 * gives option to restart game
 */
import Bird from '../objects/Sprites/Bird';

import DataAccess from '../objects/Helpers/DataAccess';
import FactoryUi from '../objects/Helpers/FactoryUi';

export default class Gameover extends Phaser.State {

  create() {
    this.background = FactoryUi.displayBg(this.game);
    this.stateBtns = FactoryUi.createStateChangeButtons(this.game);

    //Game Over! text
    this.titleText = this.add.text(0, 0, 'Game Over!', this.game.fonts.title);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.info = this.displayGameoverInfo();
    this.tweenScores();

    this.positionDisplayObjects();
    this.unlockedBirds = this.add.group();
    this.displayNewlyUnlockedSprites();
  }

  positionDisplayObjects() {
    this.sizeDisplayObjects();

    this.info.x = this.game.world.centerX;
    this.info.y = this.game.world.centerY;

    this.titleText.bottom = this.info.top;
    this.titleText.x = this.game.world.centerX;

    this.stateBtns.x = this.game.world.centerX;
    this.stateBtns.top = this.info.bottom;
  }


  sizeDisplayObjects() {
    this.info.height = Math.min(this.game.height * 0.6, this.info.height);
    this.info.scale.x = this.info.scale.y;

    this.titleText.height = Math.min(this.game.height * 0.2, this.titleText.height);
    this.titleText.scale.x = this.titleText.scale.y;

    this.stateBtns.height = Math.min(this.game.height * 0.2, this.stateBtns.height);
    this.stateBtns.scale.x = this.stateBtns.scale.y;
  }

  displayNewlyUnlockedSprites() {
    const newSkins = this.unlockSprites();

    if (newSkins.length == 0) return;

    //display all the new sprites!
    this.prevFall = null;
    newSkins.forEach(function(birdId) {
      const firstBirdFrame = Bird.birdFrameName(birdId, 1);

      var newBird = this.add.image(this.game.world.centerX, 0, this.game.spritesheetKey, firstBirdFrame);
      this.unlockedBirds.add(newBird);
      newBird.width = this.game.dimen.width.playerOriginal * 2;
      newBird.scale.y = newBird.scale.x;
      newBird.anchor.setTo(0.5, 0.5);

      const fallInTween = this.add.tween(newBird).to({
        y: this.game.world.centerY
      }, 3000, Phaser.Easing.Bounce.Out, !this.prevFall);
      fallInTween.onComplete.add(function() { //grow after falling
        const len = 500;
        this.add.tween(newBird.scale).to({
          x: newBird.scale.x * 5,
          y: newBird.scale.y * 5
        }, len, Phaser.Easing.Linear.None, true);
        this.add.tween(newBird).to({
          alpha: 0
        }, len, Phaser.Easing.Linear.None, true);
      }, this);
      newBird.visible = !this.prevFall;

      //chain the unlocked sprite's tweens together
      if (this.prevFall) {
        this.prevFall.onComplete.add(function() {
          this.showUnlockedText();
          newBird.visible = true;
          fallInTween.start();
        }, this);
      }
      this.prevFall = fallInTween;
    }, this);

    this.showUnlockedText();
  }

  showUnlockedText() {
    //display some text
    var unlockedText = this.add.text(this.game.world.centerX, this.game.world.centerY, 'UNLOCKED', this.game.fonts.title);
    unlockedText.anchor.setTo(0.5, 0.5);

    //tween in the unlocked text, and hide it on completion
    const unlockedGrowTween = this.add.tween(unlockedText.scale)
      .from({
        x: 0.5,
        y: 0.5
      }, 1000, Phaser.Easing.Quadratic.Out, true);
    this.add.tween(unlockedText)
      .to({
        angle: 10
      }, 100, Phaser.Easing.Linear.None, true, 0, -1, true);

    unlockedGrowTween.onComplete.add(function() {
      unlockedText.destroy();
    }, this);
  }

  unlockSprites() {
    var idsToAddToUnlockSprites = [];
    //cache saved vars relating to unlocking new sprites
    const medals = DataAccess.getConfig('medals');
    const numMedals = medals.reduce(function(a, b) { //sum up all the medals
      return a + b;
    }, 0);
    const kills = DataAccess.getConfig('kills');
    const maxScore = DataAccess.getConfig('maxScore');
    //const level = DataAccess.getConfig('level');
    const prevUnlocks = DataAccess.getConfig('unlockedBirdSprites');

    //check for any newly unlocked Sprites
    for (var i = 0; i < kills.length; i++) {
      if (!prevUnlocks.includes(i)) {
        const unlockCriteria = this.game.integers.skinUnlockCriteria[i];

        if (unlockCriteria) {
          if (unlockCriteria.medal && medals[unlockCriteria.medal.type] >= unlockCriteria.medal['#']) idsToAddToUnlockSprites.push(i);
          else if (unlockCriteria.maxScore && maxScore >= unlockCriteria.maxScore) idsToAddToUnlockSprites.push(i);
          else if (unlockCriteria.timesEaten && kills[i] >= unlockCriteria.timesEaten) idsToAddToUnlockSprites.push(i);
          else if (unlockCriteria.totalMedals && numMedals >= unlockCriteria.totalMedals) idsToAddToUnlockSprites.push(i);
        }
      }
    }

    //add newly unlocked sprites to saved unlocks
    DataAccess.setConfig('unlockedBirdSprites', prevUnlocks.concat(idsToAddToUnlockSprites));

    return idsToAddToUnlockSprites;
  }

  displayGameoverInfo() {
    var info = new Phaser.Group(this.game);

    var background = FactoryUi.getBgGraphic(this.game, this.game.dimen.height.gameoverTextBox * 1.5, this.game.dimen.height.gameoverTextBox);

    const gameScore = DataAccess.getConfig('score');
    const level = DataAccess.getConfig('level');
    const maxScore = DataAccess.setConfig('maxScore', Math.max(gameScore, DataAccess.getConfig('maxScore')));
    const maxLevel = DataAccess.setConfig('maxLevel', Math.max(level, DataAccess.getConfig('maxLevel')));

    this.score = this.add.text(0, 0, Number(gameScore).toLocaleString(), this.game.fonts.text);
    this.score.padding.setTo(this.game.fonts.text.padding.x, this.game.fonts.text.padding.y);
    this.score.bottom = background.y;
    this.score.right = background.right - background.width / 15;
    var scoreHeader = this.add.text(0, 0, 'Score', this.game.fonts.gameover_headers);
    scoreHeader.right = this.score.right;
    scoreHeader.bottom = this.score.top;

    var levelHeader = this.add.text(0, 0, 'Level', this.game.fonts.gameover_headers);
    levelHeader.anchor.setTo(0.5, 0.5);
    levelHeader.x = 0;
    levelHeader.bottom = scoreHeader.bottom;
    this.level = this.add.text(0, 0, Number(level).toLocaleString(), this.game.fonts.text);
    this.level.padding.setTo(this.game.fonts.text.padding.x, this.game.fonts.text.padding.y);
    this.level.anchor.setTo(0.5, 0.5);
    this.level.top = levelHeader.bottom;
    this.level.right = levelHeader.right;

    var maxScoreHeader = this.add.text(0, 0, 'Best', this.game.fonts.gameover_headers);
    maxScoreHeader.top = this.score.bottom;
    maxScoreHeader.right = this.score.right;
    this.maxValue = this.add.text(0, 0, Number(maxScore).toLocaleString(), this.game.fonts.text);
    this.maxValue.padding.setTo(this.game.fonts.text.padding.x, this.game.fonts.text.padding.y);
    this.maxValue.top = maxScoreHeader.bottom;
    this.maxValue.right = maxScoreHeader.right;

    var maxLevelHeader = this.add.text(0, 0, 'Best', this.game.fonts.gameover_headers);
    maxLevelHeader.bottom = maxScoreHeader.bottom;
    maxLevelHeader.right = levelHeader.right;
    this.maxLevel = this.add.text(0, 0, Number(maxLevel).toLocaleString(), this.game.fonts.text);
    this.maxLevel.padding.setTo(this.game.fonts.text.padding.x, this.game.fonts.text.padding.y);
    this.maxLevel.top = maxLevelHeader.bottom;
    this.maxLevel.right = maxLevelHeader.right;

    var medalText = this.add.text(0, 0, 'Medal', this.game.fonts.gameover_headers);
    medalText.anchor.setTo(0.5, 0.5);
    medalText.left = background.left + background.width / 15;

    //get medal level from score and increment the attained medal
    const medalLevel = FactoryUi.medalLevel(this.game, gameScore);
    var medalsCount = DataAccess.getConfig('medals');
    medalsCount[medalLevel]++;
    DataAccess.setConfig('medals', medalsCount);

    this.medal = FactoryUi.createMedal(this.game, medalLevel);
    this.medal.x = medalText.x;
    this.medal.y = background.y;
    medalText.bottom = this.medal.top;


    const shareBtn = new Phaser.Button(this.game, this.medal.x, this.maxValue.bottom, this.game.spritesheetKey,
      function() {
        if (this.game.device.cordova) window.plugins.socialsharing.shareWithOptions(this.getShareOptions(level, gameScore));
        else alert('Sharing not supported');
      }, this, 'sharePressed', 'share', 'sharePressed', 'share');
    shareBtn.anchor.setTo(0.5, 0.5);
    shareBtn.width = this.game.dimen.len.shareBtn;
    shareBtn.height = this.game.dimen.len.shareBtn;

    info.addChild(background);
    info.addChild(scoreHeader);
    info.addChild(this.score);
    info.addChild(maxScoreHeader);
    info.addChild(this.maxValue);
    info.addChild(maxLevelHeader);
    info.addChild(this.maxLevel);
    info.addChild(levelHeader);
    info.addChild(this.level);
    info.addChild(medalText);
    info.addChild(this.medal);
    info.addChild(shareBtn);

    return info;
  }

  getShareOptions(level, score) {
    var url = null;
    if (this.game.device.iOS) {
      url = this.game.strings.shareOptions.url.ios;
    } else if (this.game.device.android) {
      url = this.game.strings.shareOptions.url.android;
    } else if (this.game.device.windowsPhone) {
      url = this.game.strings.shareOptions.url.windowsPhone;
    } else {
      url = this.game.strings.shareOptions.url.other;
    }
    this.game.strings.shareOptions.url = url;

    this.game.strings.shareOptions.message =
      this.game.strings.shareOptions.msg.replace('LVL', level.toLocaleString()).replace('SCR', score.toLocaleString());

    return this.game.strings.shareOptions;
  }

  tweenScores() {

    const tweenStat = function(obj) {
      const growShrink = this.add.tween(obj.scale).to({
        x: obj.scale.x * 1.25,
        y: obj.scale.y * 1.25
      }, this.game.durations.gameoverGrow, Phaser.Easing.Linear.In).to({
        x: obj.scale.x,
        y: obj.scale.y
      }, this.game.durations.gameoverGrow, Phaser.Easing.Linear.In);
      growShrink.start();
    }.bind(this);
    tweenStat(this.score);
    tweenStat(this.maxValue);
    tweenStat(this.maxLevel);
    tweenStat(this.medal);
    tweenStat(this.level);

    this.game.time.events.add(this.game.durations.gameoverGrow * 2,
      function() {
        this.add.tween(this.titleText)
          .to({
            angle: -this.game.integers.gameoverTextTween.angle
          }, this.game.durations.gameoverTextTween.lifespan, Phaser.Easing.Linear.None)
          .to({
            angle: this.game.integers.gameoverTextTween.angle
          }, this.game.durations.gameoverTextTween.lifespan, Phaser.Easing.Linear.None, true, 0, -1, true);
      }, this);

  }
}
