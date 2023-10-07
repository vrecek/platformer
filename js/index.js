import Entity from "./Entity.js";
import Game from "./Game.js";
import Player from "./Player.js";
console.log('start');
const GAME = new Game(), CTX = GAME.getCtx();
const PLAYER = new Player(0, 560, 40, 40, 2, CTX);
const ENEMY_ENTITIES = [
// new Entity(50, 50, 40, 40, CTX),
// new Entity(250, 200, 80, 40, CTX),
// new Entity(600, 200, 80, 40, CTX),
// new Entity(680, 200, 40, 120, CTX),
];
const SURFACE_ENTITIES = [
    new Entity(100, 300, 80, 40, CTX),
    new Entity(0, 500, 80, 40, CTX),
    new Entity(200, 560, 80, 40, CTX)
];
// let blockedKeys: MoveKeys[] = []
GAME.setWidth(800, 600);
GAME.update(() => {
    PLAYER.draw('#000');
    for (const ent of ENEMY_ENTITIES)
        ent.draw('red');
    for (const ent of SURFACE_ENTITIES)
        ent.draw('green');
    const ent_surfaceCollision = PLAYER.checkCollision(SURFACE_ENTITIES);
    PLAYER.handleAdvancedMoveKeys();
    PLAYER.handleGravity(!!ent_surfaceCollision, PLAYER.isCanvasCollided(GAME.getCanvasStats()));
    PLAYER.checkCollision(ENEMY_ENTITIES, collidedWithEnemy);
    PLAYER.checkCollision(SURFACE_ENTITIES, collidedWithSurface, () => PLAYER.resetBlockedKeys());
    PLAYER.handleCanvasCollision(GAME.getCanvasStats());
});
PLAYER.initPressKeyEvents();
// --------------- Funcs ------------------
// When collided with a wall/floor
const collidedWithSurface = (ent) => {
    PLAYER.stopCollisionMovement(ent);
};
// Game over
const collidedWithEnemy = () => {
    // PLAYER.setPlayerPos(0, 0)
    // PLAYER.changePlayerMovementStatus(false)
    // setTimeout(() => PLAYER.changePlayerMovementStatus(true), 500)
    console.log('Game over');
    PLAYER.changePlayerMovementStatus(false);
};
// jumping, alternative movement
