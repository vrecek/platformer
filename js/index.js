import Entity from "./Entity.js";
import Game from "./Game.js";
import Player from "./Player.js";
console.log('start');
const GAME = new Game(), CTX = GAME.getCtx();
const PLAYER = new Player(0, 0, 40, 40, 2.5, CTX);
const ENEMY_ENTITIES = [
    new Entity(50, 50, 40, 40, CTX),
    new Entity(250, 200, 80, 40, CTX),
    new Entity(600, 200, 80, 40, CTX),
    new Entity(680, 200, 40, 120, CTX),
];
const SURFACE_ENTITIES = [
    new Entity(400, 200, 80, 40, CTX),
    new Entity(400, 200, 80, 40, CTX),
    new Entity(100, 300, 80, 40, CTX)
];
let blockedKeys = [];
GAME.setWidth(800, 600);
GAME.update(() => {
    PLAYER.draw('#000');
    for (const ent of ENEMY_ENTITIES)
        ent.draw('red');
    for (const ent of SURFACE_ENTITIES)
        ent.draw('green');
    PLAYER.checkCollision(SURFACE_ENTITIES, collidedWithSurface, resetBlockKey);
    PLAYER.checkCollision(ENEMY_ENTITIES, collidedWithEnemy);
    PLAYER.handleCanvasCollision(blockedKeys, GAME.getCanvasStats());
    PLAYER.handleStandardMoveKeys(blockedKeys);
});
PLAYER.initPressKeyEvents();
// --------------- Funcs ------------------
// Resets the array of blocked keys
const resetBlockKey = () => {
    blockedKeys = [];
};
// When collided with a wall/floor
const collidedWithSurface = (ent) => {
    const key = PLAYER.getCollisionStopKey(ent.getStats());
    if (key)
        blockedKeys.push(key);
};
// Game over
const collidedWithEnemy = () => {
    // PLAYER.setPlayerPos(0, 0)
    console.log('Game over');
    PLAYER.changePlayerMovementStatus(false);
};
