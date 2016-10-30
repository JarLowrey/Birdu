/*
 * Preload state
 * =============
 *
 * Takes care of loading the main game assets, including graphics and sound
 * effects, while displaying a splash screen with a progress bar, showing how
 * much progress were made during the asset load.
 */

import assets from '../assets';

import DataAccess from '../objects/Helpers/DataAccess';

export default class Preload extends Phaser.State {

  preload() {
    this.showSplashScreen();

    this.game.load.onFileComplete.add(this.fileComplete, this);
    this.game.load.onLoadComplete.addOnce(this.onLoadComplete, this);

    this.game.load.pack('game', null, assets);
  }

  create() {
    // Here is a good place to initialize plugins that depend on any game
    // asset. Don't forget to `import` them first. Example:
    //this.add.plugin(MyPlugin/*, ... initialization parameters ... */);

    // Prevent directions key events bubbling up to browser,
    // since these keys will make web page scroll which is not
    // expected. These inputs can be used by the Player prefab
    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN
    ]);
  }

  // --------------------------------------------------------------------------

  fileComplete(progress) {
    this.loadingText.setText(progress + '%');
  }

  showSplashScreen() {
    const preloadInfo = this.game.cache.getJSON('preloadJSON');

    /*
        //loading image while loading other assets
        this.loadingBar = this.add.sprite(0, this.game.height / 2, 'progress-bar'); //positions loading icon on left side of game, middle of screen
        this.loadingBar.anchor.setTo(0, 0.5); //loading icon's anchor is its left side, middle of its height (so that it is placed vertically in the middle, but only grows to its right)
        this.loadingBar.width = this.game.width / 2;
        this.loadingBar.x = this.game.world.centerX - this.loadingBar.width / 2;
        this.load.setPreloadSprite(this.loadingBar); //loading icon will grow to the right, completing when it hits the right side

        this.loadingBarBackground = this.add.sprite(this.loadingBar.x, this.loadingBar.y, 'progress-bar');
        this.loadingBarBackground.tint = 0x000000;
        this.loadingBarBackground.anchor.setTo(0, 0.5);
        this.loadingBarBackground.width = this.loadingBar.width;
    */
    this.loadingText = this.add.text(this.game.world.centerX,
      //this.loadingBar.y - this.loadingBar.height / 2 - 25,
      this.game.world.centerY,
      '0%', preloadInfo.font);
    this.loadingText.anchor.setTo(0.5, 0.5);
    this.loadingText.padding.setTo(preloadInfo.font.padding.x, preloadInfo.font.padding.y);

    this.devName = this.add.text(this.game.world.width,
      this.game.world.height,
      this.game.devName, preloadInfo.font);
    this.devName.anchor.setTo(1, 1);

    this.game.stage.backgroundColor = preloadInfo.bgColor;

    //show splash screen for a few seconds, then call check if next state can start
    this.splashScreenOver = false;
    this.game.time.events.add(preloadInfo.minSplashScreenShowTime, this.finishedSplashScreen, this);
  }

  finishedSplashScreen() {
    this.splashScreenOver = true;

    this.startNextState();
  }

  setJson() {
    this.game.fonts = this.game.cache.getJSON('font_styles');
    this.game.dimen = this.game.cache.getJSON('dimen');
    /*
    for (var dimension in this.game.dimen) { //adjust dimensions for different screen densities
      this.game.dimen[dimension] = this.game.dimen[dimension] * window.devicePixelRatio;
    }
    */
    this.game.durations = this.game.cache.getJSON('durations');
    this.game.speeds = this.game.cache.getJSON('speeds');

    this.game.animationInfo = this.game.cache.getJSON('animationInfo');
    this.game.integers = this.game.cache.getJSON('integers');
    this.game.strings = this.game.cache.getJSON('strings');
    this.game.colors = this.game.cache.getJSON('colors');
  }

  onLoadComplete() {
    this.setJson();
    DataAccess.initializeSavedData(this.game);

    this.game.spritesheetKey = 'spritesheet';
    this.loadingText.setText('100%');

    this.startNextState();
  }

  startNextState() {
    if (this.splashScreenOver && this.load.hasLoaded) { //splash screen has been shown for a minimum amount of time, and loading assets is finished
      this.state.start('Menu');
    }
  }
}
