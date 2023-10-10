import Game from "./Game.js";
import Player from "./Player.js";
import LEVELS from "./levels/Levels.js";
console.log('Start');
const GAME = new Game(LEVELS), CTX = GAME.getCtx(), resetBtn = document.querySelector('button.reset');
// -------------------- ENTITIES --------------------------
const PLAYER = new Player(210, 30, 40, 40, 2, 5);
// ------------------------------------------------------
let initPlayerPos = false;
let currentLevel = GAME.loadLevel('current');
GAME.setWidth(800, 600);
GAME.update(() => {
    if (currentLevel) {
        const { enemies: ENEMY_ENTITIES, scores: SCORE_ENTITIES, surfaces: SURFACE_ENTITIES } = currentLevel;
        if (!initPlayerPos) {
            PLAYER.setPlayerPos(currentLevel.player.x, currentLevel.player.y);
            initPlayerPos = true;
        }
        PLAYER.draw('#000', CTX);
        for (const ent of currentLevel.enemies)
            ent.draw('red', CTX);
        for (const ent of currentLevel.surfaces)
            ent.draw('green', CTX);
        for (const ent of currentLevel.scores)
            ent.draw('royalblue', CTX);
        PLAYER.handleGravity(!!PLAYER.checkCollision(SURFACE_ENTITIES), GAME.getCanvasStats());
        PLAYER.resetBlockedKeys();
        PLAYER.checkCollision(ENEMY_ENTITIES, collidedWithEnemy);
        PLAYER.checkCollision(SURFACE_ENTITIES, collidedWithSurface);
        PLAYER.checkCollision(SCORE_ENTITIES, scoreCollide);
        PLAYER.handleCanvasCollision(GAME.getCanvasStats());
        PLAYER.handleAdvancedMoveKeys();
    }
});
GAME.updateLevelStats(1, currentLevel?.scores.length ?? 0);
PLAYER.initPressKeyEvents();
GAME.insufficientScreenHandler();
// --------------- Funcs ------------------
// Handle the "restart" button
resetBtn.addEventListener('click', () => {
    PLAYER.changePlayerMovementStatus(true);
    proceedToNextLevel(GAME.loadLevel('current'));
});
// When the player scored the point
const scoreCollide = (score) => {
    GAME.handleGettingScore(currentLevel, score);
    // When the level is finished
    if (GAME.hasLevelBeenFinished()) {
        console.log('Finished level ', GAME.getCurrentLevel());
        const nextLevel = GAME.loadLevel('next');
        if (nextLevel)
            proceedToNextLevel(nextLevel);
        else
            showFinishScreen();
    }
};
// When collided with a wall/floor
const collidedWithSurface = (ent) => {
    PLAYER.stopCollisionMovement(ent);
};
// Game over
const collidedWithEnemy = () => {
    console.log('Game over');
    PLAYER.changePlayerMovementStatus(false);
    if (document.querySelector('h3'))
        return;
    const h3 = document.createElement('h3');
    h3.textContent = 'You lost';
    document.body.appendChild(h3);
};
// Proceeds to the next level
const proceedToNextLevel = (nextLevel) => {
    document.querySelector('h3')?.remove();
    initPlayerPos = false;
    currentLevel = nextLevel;
    GAME.updateScoreText();
};
// When finished every level
const showFinishScreen = () => {
    console.log('Finish');
    document.body.textContent = null;
    const h1 = document.createElement('h1');
    h1.textContent = 'You have finished the game';
    const btnRestart = document.createElement('button');
    btnRestart.textContent = 'Restart';
    btnRestart.onclick = () => window.location.reload();
    const a = document.createElement('a');
    a.textContent = 'Source code';
    a.href = 'https://github.com/vrecek/platformer';
    a.target = '_blank';
    const finishWrapper = document.createElement('section');
    finishWrapper.className = 'finish-wrapper';
    finishWrapper.appendChild(h1);
    finishWrapper.appendChild(btnRestart);
    finishWrapper.appendChild(a);
    document.body.appendChild(finishWrapper);
};
