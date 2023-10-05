import Entity from "./Entity.js";
import Game from "./Game.js";
import Player from "./Player.js";
console.log('start');
const GAME = new Game();
const PLAYER = new Player(0, 0, 40, 40, 2.5, GAME.getCtx);
const ENTITIES = [
    new Entity(50, 50, 40, 40, GAME.getCtx),
    new Entity(250, 200, 80, 40, GAME.getCtx),
    new Entity(600, 200, 80, 40, GAME.getCtx),
    new Entity(680, 200, 40, 120, GAME.getCtx),
];
GAME.setWidth(800, 600);
GAME.update(() => {
    PLAYER.handleMoveKeys();
    PLAYER.draw('#000');
    for (const ent of ENTITIES)
        ent.draw('red');
    PLAYER.checkCollision(ENTITIES, collidedPlayer);
});
PLAYER.initPressKeyEvents();
// --------------- Funcs ------------------
const collidedPlayer = () => {
    if (!PLAYER.getMovementStatus)
        return;
    console.log('Game over');
    PLAYER.changePlayerMovementStatus(false);
};
