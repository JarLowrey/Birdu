/*
 * Game state
 * ==========
 *
 * A sample Game state, displaying the Phaser logo.
 */

//required modules (classes) with the help of browserify
import Star from '../objects/Sprites/Star';
import Cloud from '../objects/Sprites/Cloud';
import LevelUpCoin from '../objects/Sprites/LevelUpCoin';
import MovingScore from '../objects/Sprites/MovingScore';

import PieProgress from '../objects/Sprites/PieProgress';

import Player from '../objects/Sprites/Player';

import DataAccess from '../objects/Helpers/DataAccess';
import Pools from '../objects/Pools';
import FactoryUi from '../objects/Helpers/FactoryUi';

export default class Game extends Phaser.State {

  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.background = FactoryUi.displayBg(this.game);

    //player/player! Create last so he appears over top of other elements
    this.game.player = new Player(this.game);
    this.add.existing(this.game.player);

    this.levelupCoin = new LevelUpCoin(this.game);
    this.add.existing(this.levelupCoin);

    //Create the score label at top right of screen
    this.scoreLabel = this.add.text(this.game.world.width - this.game.dimen.margin.sideOfScreen,
      this.game.dimen.margin.sideOfScreen,
      this.score,
      this.game.fonts.score);
    this.scoreLabel.anchor.setTo(1, 0);
    //Create a tween to grow (for 200ms) and then shrink back to normal size (in 200ms)
    this.scoreLabelTween = this.add.tween(this.scoreLabel.scale).to({
      x: 1.5,
      y: 1.5
    }, 200, Phaser.Easing.Linear.In).to({
      x: 1,
      y: 1
    }, 200, Phaser.Easing.Linear.In);

    //play/pause icon
    this.pauseBtn = new Phaser.Button(this.game, 0, 0, this.game.spritesheetKey, this.pauseGame, this, 'pausePressed', 'pause');
    this.resumeBtn = new Phaser.Button(this.game, 0, 0, this.game.spritesheetKey, null, this, 'playPressed', 'play', 'playPressed', 'play');
    this.game.input.onDown.add(this.resumeGame, this); //add a listener for unpausing the game. Cannot be bound to a sprite/text/btn (as these become paused as well)
    this.pauseBtn.anchor.setTo(0.5, 0.5);
    this.resumeBtn.anchor.setTo(0.5, 0.5);
    this.game.world.add(this.pauseBtn);
    this.game.world.add(this.resumeBtn);

    //progress bar
    this.pieProgress = new PieProgress(this.game, 0, 0,
      this.game.dimen.radius.progressPie, '#fff', -90, this.level);
    this.pieProgress.setProgress(0);
    this.game.world.add(this.pieProgress);

    //load the pause menu (just some text in this game) after the player, so that it appears over top
    this.pauseText = this.add.text(this.game.world.centerX, this.game.world.centerY, 'Paused', this.game.fonts.score);
    this.pauseText.anchor.setTo(0.5, 0.5);

    //things to be shown upon leveling up
    this.levelupText = this.add.text(0, 0, 'Level Up', this.game.fonts.score);
    this.levelupText.anchor.setTo(0.5, 0.5);

    this.positionDisplayObjects();

    this.setupState();
  }

  setupState() {
    this.game.spritePools = new Pools(this.game);

    this.loadLevel();
    this.game.world.bringToTop(this.pauseText); //bring pause text over top of all sprites created

    this.pieProgress.setText(this.level);
    this.scoreLabel.setText(this.score.toLocaleString());

    this.enemySpawnTimer = this.game.time.create(false);
    this.enemySpawnTimer.start();
    this.enemySpawnTimer.loop(this.game.durations.spawnFreq, this.spawnEnemy, this);

    this.starSpawnTimer = this.game.time.create(false);
    this.starSpawnTimer.start();
    this.starSpawnTimer.add(this.getStarSpawnTime(), this.spawnCloud, this);

    this.cloudSpawnTimer = this.game.time.create(false);
    this.cloudSpawnTimer.start();
    this.cloudSpawnTimer.add(this.getCloudSpawnTime(), this.spawnStar, this);

    //combo variables
    this.comboBaseScoreFromEating = 0; //score that is added by eating birds in a combo series. Nothing added from the combo itself
    this.comboCount = 0;
    this.comboTimer = null;

    //load audio
    this.add.audio('tweet').play();

    this.setStartingUiVisibility();

    if (this.score) {
      this.pauseGame();
    }
  }

  sizeDisplayObjects() {
    this.pauseBtn.width = this.game.dimen.len.pauseBtn;
    this.pauseBtn.height = this.game.dimen.len.pauseBtn;

    this.resumeBtn.width = this.game.dimen.len.pauseBtn;
    this.resumeBtn.height = this.game.dimen.len.pauseBtn;
  }

  positionDisplayObjects() {
    this.sizeDisplayObjects();

    this.levelupCoin.x = this.game.world.centerX;
    this.levelupCoin.y = 0;

    this.levelupText.x = this.game.world.centerX;
    this.levelupText.y = this.game.dimen.margin.sideOfScreen + this.levelupText.height / 2;

    this.pieProgress.x = this.game.dimen.margin.sideOfScreen + this.game.dimen.radius.progressPie;
    this.pieProgress.y = this.game.dimen.margin.sideOfScreen + this.game.dimen.radius.progressPie;

    this.pauseBtn.right = this.game.world.width - this.game.dimen.margin.sideOfScreen;
    this.pauseBtn.bottom = this.game.world.height - this.game.dimen.margin.sideOfScreen;

    this.resumeBtn.right = this.game.world.width - this.game.dimen.margin.sideOfScreen;
    this.resumeBtn.bottom = this.game.world.height - this.game.dimen.margin.sideOfScreen;
  }
  setStartingUiVisibility() {
    this.pauseText.visible = false;
    this.levelupText.visible = false;
    this.resumeBtn.visible = false;
  }

  spawnEnemy() {
    if (!this.game.player.alive) return;

    //don't spawn if screen too crowded
    if (this.game.spritePools.ratioEnemyAreaToGameArea() < this.game.dimen.maxSpawningArea) {
      this.game.spritePools.spawnEnemy(this.level);
    }
  }
  spawnStar() {
    if (!this.game.player.alive) return;
    this.game.spritePools.spawn(Star.className());
    this.starSpawnTimer.add(this.getStarSpawnTime(), this.spawnCloud, this);
  }
  spawnCloud() {
    if (!this.game.player.alive) return;
    this.game.spritePools.spawn(Cloud.className());
    this.starSpawnTimer.add(this.getCloudSpawnTime(), this.spawnCloud, this);
  }

  getStarSpawnTime() {
    const starSpawnInfo = this.game.durations.spawn.star;
    return this.game.floatBetween(starSpawnInfo.min, starSpawnInfo.max);
  }
  getCloudSpawnTime() {
    const cloudSpawnInfo = this.game.durations.spawn.cloud;
    return this.game.floatBetween(cloudSpawnInfo.min, cloudSpawnInfo.max);
  }
  pauseGame() {
    if (!this.game.paused) {
      this.resumeBtn.visible = true;
      this.pauseBtn.visible = false;
      this.pauseText.visible = true;

      if (this.game.player.alive) {
        this.saveLevel();
        this.saveSprites();
      }

      this.game.paused = true; //actually pause the game
    }
  }

  resumeGame() {
    //the way the click listener is setup, this function is called on every tap/click.
    //Thus need to ensure it only fires when game is actually paused
    if (this.game.paused) {
      this.resumeBtn.visible = false;
      this.pauseBtn.visible = true;
      this.pauseText.visible = false;

      this.game.paused = false;
    }
  }

  update() {
    this.game.spritePools.collideAll();

    this.updateScoreFromBuffer();
  }

  birdCollide(player, enemy) {
    const orginalPlayerWidth = this.game.player.width;
    const enemyArea = enemy.area();

    Player.birdsCollide.bind(this)(this.game.player, enemy);
    if (!this.game.player.alive || enemy.alive) return; //enemy will remain alive if player is invincible

    //Add enemy's area to total score
    //show this meal's score travel up towards total score. add it to current combo
    const playerArea = this.game.player.area();
    var scoreIncrease = Math.round(Math.sqrt(enemyArea));

    //create the label that flies up to the main score label
    this.game.spritePools.spawn(MovingScore.className()).startMovement(scoreIncrease, this.scoreLabel, this.scoreLabelTween);

    this.addToCombos(scoreIncrease);

    /*
      Progress towards next level up, but...

      If waiting for the coin to hit player (thus reseting size & incrementing level), do no allow the player to grow in size or progress in next level.
      This prevents confusing scenarios where player levels up, coin starts moving, player eats enemy before coin arrives, player's size is
      set assuming next level has begun, coin arrives & shrinks player, player eats enemy & grows larger than before coin arrives.

      While waiting for coin player can still increase score, so no harm is done by making them wait to progress in level.
    */
    if (!this.levelupCoin.visible) {
      const areaToLevelUp = this.game.player.levelupArea(this.level);

      this.pieProgress.setProgress(playerArea / areaToLevelUp);

      //check for level up
      if (playerArea > areaToLevelUp) {
        this.levelUp();
      }
    } else { //if levelupCoin is traveling, don't increase bird size
      this.game.player.setSizeFromWidth(orginalPlayerWidth);
    }
  }

  shutdown() {
    this.saveLevel();
  }

  saveLevel() {
    DataAccess.setConfig('score', this.score + this.scoreBuffer);
    DataAccess.setConfig('level', this.level);
    this.scoreBuffer = 0;
  }

  saveSprites() {
    const allSprites = this.game.spritePools.serialize();
    DataAccess.setConfig('sprites', allSprites);

    DataAccess.setConfig('player', this.game.player.serialize());
  }

  loadLevel() {
    const playerInfo = DataAccess.getConfig('player');
    if (playerInfo) {
      this.game.player.deserialize(playerInfo);
      this.score = DataAccess.getConfig('score');
      this.level = DataAccess.getConfig('level');
    } else {
      this.score = 0;
      this.level = 0;
    }

    this.scoreBuffer = 0;

    const allSprites = DataAccess.getConfig('sprites');
    this.game.spritePools.deserialize(allSprites);
  }

  updateScoreFromBuffer() {
    if (this.scoreBuffer > 0) {
      var change;
      if(this.scoreBuffer < 20) {
        change = this.scoreBuffer;
      }else{
        change =  Math.ceil(this.scoreBuffer / 2);
      }

      this.score += change;
      this.scoreLabel.setText(this.score.toLocaleString());
      this.scoreBuffer -= change;
    }
  }

  addToCombos(scoreIncrease) {
    //increase combo and score amount. (Re)start the end-of-combo timer as needed
    this.comboBaseScoreFromEating += scoreIncrease;
    this.comboCount += 1;

    if (this.comboTimer) { //true if it is not null. Thus a timer is already running
      this.game.time.events.remove(this.comboTimer); //stop previous timer from firing the 'completedCombo' events
      this.comboTimer = this.game.time.events.add(Phaser.Timer.SECOND, this.completedCombo, this); //restart the timer
    } else {
      this.comboTimer = this.game.time.events.add(Phaser.Timer.SECOND, this.completedCombo, this);
    }
  }

  levelUp() {
    this.level++;
    this.pieProgress.setProgress(0);

    //start moving the coin towards the player
    this.levelupCoin.visible = true;

    this.levelupText.scale.setTo(2, 2);
    this.levelupText.angle = -10;
    this.levelupText.visible = true;

    //tween in the level up text, and hide + reset it on completion
    this.levelupText_grow_tween = this.add.tween(this.levelupText.scale)
      .from({
        x: 0.5,
        y: 0.5
      }, 1000, Phaser.Easing.Quadratic.Out, true);
    this.levelupText_rotate_tween = this.add.tween(this.levelupText)
      .to({
        angle: 10
      }, 100, Phaser.Easing.Linear.None, true, 0, -1, true);

    this.levelupText_grow_tween.onComplete.add(function() {
      //reset text size/properties
      this.levelupText.scale.setTo(1.5, 1.5);
      this.levelupText.angle = -10;
      this.levelupText.visible = false;
      this.levelupText_rotate_tween.stop();
    }, this);
  }

  //Create cool text+tweens for displaying number of combos+how much score it added, then add that score to total
  completedCombo() {
    if (this.comboCount > 1) {
      const comboScoreInc = Math.round(this.comboBaseScoreFromEating * (this.comboCount / 10.0));
      const numComboTxt = 'Combo x' + this.comboCount;
      //Create a new label for displaying how many combos the user got, then transform it into a score and move up to labelz
      this.game.spritePools.spawn(MovingScore.className()).startMovement(comboScoreInc, this.scoreLabel, this.scoreLabelTween, numComboTxt, this.game.fonts.combo);
    }
    //reset combo stats and set the timer to null (it has already completed [hence we're in this function], so we do not need to remove it from events queue)
    this.comboBaseScoreFromEating = 0;
    this.comboCount = 0;
    this.comboTimer = null;
  }

  incrementScoreBuffer(amt) {
    this.scoreBuffer += amt;
  }

}
