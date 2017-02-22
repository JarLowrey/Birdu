/*
 * Settings state
 */
import ToggleSlider from '../objects/ToggleSlider';

import FactoryUi from '../objects/Helpers/FactoryUi';

export default class Settings extends Phaser.State {

  create() {
    this.background = FactoryUi.displayBg(this.game);
    this.stateBtns = FactoryUi.createStateChangeButtons(this.game);

    this.toggles = this.createToggles();

    this.creditsBtn = new Phaser.Button(this.game, 0, 0, this.game.spritesheetKey, function() {
      const msg = this.game.strings.credits.join('\n');
      if (this.game.device.cordova) {
        navigator.notification.alert(msg, null, this.game.strings.creditsTitle);
      } else {
        alert(msg);
      }
    }, this, 'creditsPressed', 'credits', 'creditsPressed', 'credits');
    this.game.world.add(this.creditsBtn);
    this.creditsBtn.anchor.setTo(0.5, 0.5);
    this.creditsBtn.width = this.game.dimen.len.menuBtn * 0.75;
    this.creditsBtn.scale.y = this.creditsBtn.scale.x;

    this.stateBtns.settings.visible = false;
    this.positionDisplayObjects();
  }

  createToggles() {
    const toggles = new Phaser.Group(this.game);
    const margin = this.game.dimen.margin.settingsToggle;

    //Event function on volume buttons clicked
    const toggle = function(dataName) {
      return function() {
        //change settings
        this.game.data.settings[dataName] = !this.game.data.settings[dataName];

        if (dataName == 'muted') this.game.sound.volume = Number(!this.game.data.settings.muted); //apply volume settings
      };
    };

    this.shakeText = this.add.text(0, 0, 'Screen Shake', this.game.fonts.smallText);
    this.shakeText.anchor.setTo(0.5, 0.5);
    this.shakeSlider = new ToggleSlider(this.game, toggle('screenShake'), this.game.data.settings.screenShake);
    this.shakeSlider.x = this.shakeText.x;
    this.shakeSlider.top = this.shakeText.bottom;

    this.mutedText = this.add.text(0, 0, 'Muted', this.game.fonts.smallText);
    this.mutedText.anchor.setTo(0.5, 0.5);
    this.mutedText.right = this.shakeText.left - margin;
    this.mutedSlider = new ToggleSlider(this.game, toggle('muted'), this.game.data.settings.muted);
    this.mutedSlider.x = this.mutedText.x;
    this.mutedSlider.top = this.mutedText.bottom;

    this.vibrationText = this.add.text(0, 0, 'Vibration', this.game.fonts.smallText);
    this.vibrationText.anchor.setTo(0.5, 0.5);
    this.vibrationText.left = this.shakeText.right + margin;
    this.vibrationSlider = new ToggleSlider(this.game, toggle('vibration'), this.game.data.settings.vibration);
    this.vibrationSlider.x = this.vibrationText.x;
    this.vibrationSlider.top = this.shakeText.bottom;

    toggles.addChild(this.mutedText);
    toggles.addChild(this.mutedSlider);
    toggles.addChild(this.shakeText);
    toggles.addChild(this.shakeSlider);
    toggles.addChild(this.vibrationText);
    toggles.addChild(this.vibrationSlider);

    return toggles;
  }



  sizeDisplayObjects() {
    //const toggleWidth = this.game.dimen.len.menuBtn;
    //const toggleHeight = this.game.dimen.len.menuBtn;

    this.toggles.height = Math.min(this.game.height * 0.25, this.toggles.height);
    this.toggles.scale.x = this.toggles.scale.y;

    this.stateBtns.height = Math.min(this.game.height * 0.25, this.stateBtns.height);
    this.stateBtns.scale.x = this.stateBtns.scale.y;

    this.creditsBtn.height = Math.min(this.game.height * 0.25, this.creditsBtn.height);
    this.creditsBtn.scale.x = this.creditsBtn.scale.y;
  }

  positionDisplayObjects() {
    this.sizeDisplayObjects();

    this.toggles.x = this.game.world.centerX;
    this.toggles.y = this.game.world.centerY;

    this.stateBtns.x = this.game.world.centerX;
    this.stateBtns.bottom = this.game.world.height;

    this.creditsBtn.left = 0;
    this.creditsBtn.bottom = this.game.world.height;
  }
}
