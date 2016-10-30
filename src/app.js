/*
 * `app` module
 * ============
 *
 * Provides the game initialization routine.
 */

// Required: import the Babel runtime module.
import 'babel-polyfill';

// Import game states.
import * as states from './states';

export function init() {
  const game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO);

  // Dynamically add all required game states.
  Object
    .entries(states)
    .forEach(([key, state]) => game.state.add(key, state));





  //define CordovaApp events here so they can have access the the 'game' object when called
  document.addEventListener('pause',
    function() {
      if (game.bgMusic) game.bgMusic.pause();
      if (game.state.current == 'Game') game.state.states.Game.pauseGame();
    },
    false);
  document.addEventListener('resume',
    function() {
      if (game.bgMusic) game.bgMusic.resume();
    },
    false);






  game.state.start('Boot');

  return game;
}
