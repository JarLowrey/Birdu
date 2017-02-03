/* global store */

/*
 * Stats state
 *
 * Display statistics from gameplay, allow user to choose Sprite
 */
import Bird from '../objects/Sprites/Bird';
import Alert from '../objects/Alert';

import DbAccess from '../objects/Helpers/DbAccess';
import FactoryUi from '../objects/Helpers/FactoryUi';

export default class Stats extends Phaser.State {

  create() {
    this.allSkinsProductId = 'unlock_all_skins';

    this.background = FactoryUi.displayBg(this.game);

    this.createAndDisplayUI();
  }

  async createAndDisplayUI() {
    this.setupPurchasing();

    //await on long running actions
    const score = this.game.nFormatter(await DbAccess.getConfig('maxScore'));
    const level = this.game.nFormatter(await DbAccess.getConfig('maxLevel'));
    this.birdGrid = await this.placeBirdsInGrid();
    this.birdGrid.visible = false; //hide while awaiting other long running actions
    this.medals = await this.createMedals();

    //start synchronous execution
    this.maxScore = this.game.add.text(0, 0, 'High Score: ' + score, this.game.fonts.smallText);
    this.maxLvl = this.add.text(0, 0, 'Best Level: ' + level, this.game.fonts.smallText);

    this.showUnlockedBirds();
    this.birdGrid.visible = true;

    this.stateBtns = FactoryUi.createStateChangeButtons(this.game);
    this.stateBtns.stats.visible = false;

    this.positionDisplayObjects();
  }

  async setupPurchasing() {
    //setup purchases and purchase buttons
    if (this.game.device.cordova) {
      this.initStore();

      this.buyBtn = this.add.button(0, 0, this.game.spritesheetKey, function() {
        store.order(this.allSkinsProductId);
      }, this, 'buyPressed', 'buy', 'buyPressed', 'buy');

      if (this.allSkinsProduct.canPurchase || await DbAccess.getLockedBirds(this.game).length == 0) {
        this.buyBtn.visible = false;
      }
    }
  }

  //https://github.com/j3k0/cordova-plugin-purchase/blob/master/doc/api.md
  //To delete test IAP, go to https://wallet.google.com then Transactions, and then cancel.
  initStore() {
    store.verbosity = store.INFO;

    store.register({
      id: this.allSkinsProductId,
      alias: 'All Skins',
      type: store.CONSUMABLE
    });

    //get product information after registering with the store
    //https://github.com/j3k0/cordova-plugin-purchase/blob/master/doc/api.md#product
    this.allSkinsProduct = store.get(this.allSkinsProductId);

    store.when(this.allSkinsProductId).approved(
      function(product) {
        this.applyUnlockAllSkinsIAP();
        product.finish();
      }.bind(this));

    // Log all errors
    store.error(function(error) {
      console.log('ERROR ' + error.code + ': ' + error.message);
    });

    //call servers, do work. Must be called after registering products, events/callbacks, etc
    store.refresh();
  }

  async applyUnlockAllSkinsIAP() {
    //check this purchase is needed. There is a bug in the purchase plugin used, products will keep calling the 'approved' function even if the product is 'finished'
    //https://github.com/j3k0/cordova-plugin-purchase/issues/483
    var lockedBirds = await DbAccess.getLockedBirds(this.game);
    if (lockedBirds.length == 0) return;

    const unlockAlertText = 'All skins unlocked!!\n\n' + this.game.strings.devThankYou;
    alert(unlockAlertText);
    this.buyBtn.visible = false;

    //unlock sprites
    var allBirds = await DbAccess.getConfig('unlockedBirdSprites').concat(lockedBirds);
    DbAccess.setConfig('unlockedBirdSprites', allBirds);

    //display new unlocks
    this.showUnlockedBirds();
  }

  sizeDisplayObjects() {
    this.birdGrid.height = Math.min(this.game.height * 0.55, this.birdGrid.height);
    this.birdGrid.scale.x = this.birdGrid.scale.y;

    this.maxScore.height = Math.min(this.game.height * 0.1, this.maxScore.height);
    this.maxScore.scale.x = this.maxScore.scale.y;

    this.maxLvl.height = this.maxScore.height;
    this.maxLvl.scale.x = this.maxLvl.scale.y;

    this.medals.height = Math.min(this.game.height * 0.15, this.medals.height);
    this.medals.scale.x = this.medals.scale.y;

    this.stateBtns.height = Math.min(this.game.height * 0.2, this.stateBtns.height);
    this.stateBtns.scale.x = this.stateBtns.scale.y;

    if (this.buyBtn) {
      this.buyBtn.height = Math.min(this.game.height * 0.1, this.stateBtns.height / 2);
      this.buyBtn.scale.x = this.buyBtn.scale.y;
    }
  }

  positionDisplayObjects() {
    this.sizeDisplayObjects();

    this.stateBtns.x = this.game.world.centerX;
    this.stateBtns.bottom = this.game.world.height;

    this.birdGrid.x = this.game.world.centerX - this.birdGrid.width / 2;
    this.birdGrid.bottom = this.game.world.centerY;

    this.medals.x = this.game.world.centerX - this.medals.width / 2 + this.medals.getChildAt(0).width / 2;
    this.medals.top = this.birdGrid.bottom;

    this.maxScore.bottom = this.birdGrid.top;
    this.maxScore.left = this.birdGrid.left;

    this.maxLvl.top = this.maxScore.top;
    this.maxLvl.right = this.birdGrid.right;

    if (this.buyBtn) {
      this.buyBtn.right = this.game.world.width - this.game.dimen.margin.sideOfScreen;
      this.buyBtn.bottom = this.game.world.height - this.game.dimen.margin.sideOfScreen;
    }

    //check if trying to position grid in middle has pushed things into bad positions. If so, reposition them
    if (this.medals.bottom > this.stateBtns.top || this.maxScore.top < 0) {
      this.medals.bottom = this.stateBtns.top;
      this.birdGrid.bottom = this.medals.top;
      this.maxScore.bottom = this.birdGrid.top;
      this.maxLvl.bottom = this.birdGrid.top;
    }
  }

  async placeBirdsInGrid() {
    const killData = await DbAccess.getConfig('kills');
    const width = this.game.dimen.width.gridUnlockableSprites;

    var birdGrid = new Phaser.Group(this.game);
    var currentRow;

    for (var i = 0; i < killData.length; i++) {
      const row = this.getRow(i);
      const col = this.getCol(i);

      //create a new row if needed
      if (col == 0) {
        currentRow = new Phaser.Group(this.game);
        birdGrid.addChild(currentRow);
      }

      //create new bird image
      const firstFlyingFrame = Bird.birdFrameName(i, 1);
      var bird = this.add.button(0, 0, this.game.spritesheetKey, this.clickedBird(i), this, firstFlyingFrame, firstFlyingFrame, firstFlyingFrame, firstFlyingFrame); //assign first birds position
      bird.tint = 0x000000;
      bird.alpha = 0.5;
      //size up bird image
      bird.width = width;
      bird.scale.y = bird.scale.x;

      //add number of times the bird has been eaten
      const numKillsText = this.add.text(0, 0, this.game.nFormatter(killData[i]), this.game.fonts.text);
      bird.addChild(numKillsText);
      numKillsText.height = (bird.height * 0.75) / bird.scale.y;
      numKillsText.scale.x = numKillsText.scale.y;
      numKillsText.alpha = 1 / bird.alpha;


      //place the bird images in a grid
      if (currentRow.children.length > 0) { //place bird in same row
        const prevBird = currentRow.getChildAt(col - 1);
        bird.left = prevBird.right + this.game.dimen.margin.sideOfScreen / 2;
        bird.top = prevBird.top;
      } else if (birdGrid.getChildAt(0).children.length > 0) { //place bird in new row
        const prevRow = birdGrid.getChildAt(row - 1);
        const topBird = prevRow.getChildAt(col);
        bird.left = topBird.left;
        bird.top = topBird.bottom + this.game.dimen.margin.sideOfScreen / 2;
      }

      currentRow.addChild(bird);
    }
    currentRow.x = birdGrid.x; //center the last row

    return birdGrid;
  }

  async createMedals() {
    var medals = new Phaser.Group(this.game);
    var prevMedal = null;
    const medalCounts = await DbAccess.getConfig('medals');

    for (var i = 0; i < medalCounts.length; i++) {
      var medal = FactoryUi.createMedal(this.game, i);
      medal.anchor.setTo(0.5, 0.5);

      //add text to show # medals
      const medalCount = this.game.nFormatter(medalCounts[i]);
      const medalText = this.add.text(0, 0, medalCount, this.game.fonts.text);
      medal.addChild(medalText);
      medalText.height = (medal.height * 0.5) / medal.scale.y;
      medalText.scale.x = medalText.scale.y;
      medalText.anchor.setTo(0.5, 0.5);
      medalText.alpha = 1 / medal.alpha;


      if (prevMedal) {
        medal.left = prevMedal.right;
      }
      prevMedal = medal;
      medals.addChild(medal);
    }

    return medals;
  }

  clickedBird(birdId) {
    return async function() {
      if (this.prevAlert) this.prevAlert.destroy();

      const unlockIntructions = this.getUnlockableInstructionString(birdId);

      let unlockedBirds = await DbAccess.getConfig('unlockedBirdSprites');
      if (unlockedBirds.includes(birdId)) { //already unlocked
        this.prevAlert = new Alert(this.game, unlockIntructions + '\n' + this.game.strings.skinSet);
        await DbAccess.setConfig('playerFrame', birdId);
      } else { //locked (not unlocked yet)
        this.prevAlert = new Alert(this.game, unlockIntructions);
      }

      this.prevAlert.top = this.medals.top;
    };
  }

  getUnlockableInstructionString(birdId) {
    const unlockCriteria = this.game.integers.skinUnlockCriteria[birdId];
    var str = '';

    //check for unlockable
    if (unlockCriteria) {
      if (unlockCriteria.medal) str = this.game.strings.unlocks.medal.replace('_', unlockCriteria.medal['#'].toLocaleString()).replace('_', this.game.strings.medals[unlockCriteria.medal.type]);
      else if (unlockCriteria.maxScore) str = this.game.strings.unlocks.maxScore.replace('_', unlockCriteria.maxScore.toLocaleString());
      else if (unlockCriteria.timesEaten) str = this.game.strings.unlocks.timesEaten.replace('_', unlockCriteria.timesEaten.toLocaleString());
      else if (unlockCriteria.totalMedals) str = this.game.strings.unlocks.totalMedals.replace('_', unlockCriteria.totalMedals.toLocaleString());
      else if (unlockCriteria.level) str = this.game.strings.unlocks.level.replace('_', unlockCriteria.level.toLocaleString());
      else if (unlockCriteria.comboCount) str = this.game.strings.unlocks.comboCount.replace('_', unlockCriteria.comboCount.toLocaleString());
      else if (unlockCriteria.default) str = this.game.strings.unlocks.default;
    }

    return str;
  }

  getRow(birdId) {
    return Math.floor(birdId / this.game.integers.numColumnsInUnlockablesGrid);
  }
  getCol(birdId) {
    return birdId % this.game.integers.numColumnsInUnlockablesGrid;
  }

  async showUnlockedBirds() {
    const unlockedBirds = await DbAccess.getConfig('unlockedBirdSprites');

    unlockedBirds.forEach(function(birdId) {
      const bird = this.birdGrid.getChildAt(this.getRow(birdId)).getChildAt(this.getCol(birdId));
      bird.tint = 0xffffff;
      bird.alpha = 1;
    }.bind(this));
  }

}
