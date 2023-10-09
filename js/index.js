import Game from "./Game.js";
import Player from "./Player.js";
import LEVELS from "./levels/Levels.js";
console.log('Start');
const GAME = new Game(LEVELS), CTX = GAME.getCtx();
// -------------------- ENTITIES --------------------------
const PLAYER = new Player(210, 30, 40, 40, 2, 5);
// ------------------------------------------------------
let initPlayerPos = false;
let currentLevel = GAME.getCurrentLevelDetails();
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
// --------------- Funcs ------------------
// When the player scored the point
const scoreCollide = (score) => {
    GAME.handleGettingScore(currentLevel, score);
    // When the game is finished
    if (GAME.hasLevelBeenFinished()) {
        console.log('Finished');
        const nextLevel = GAME.loadNextLevel();
        if (nextLevel) {
            initPlayerPos = false;
            currentLevel = nextLevel;
            GAME.updateScoreText();
        }
        else {
            document.body.textContent = 'End';
        }
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
};
