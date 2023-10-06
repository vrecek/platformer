import Entity from "./Entity.js"
import Game from "./Game.js"
import Player from "./Player.js"
import { MoveKeys } from "./interfaces/PlayerTypes.js"


console.log('start')


const GAME: Game = new Game(),
      CTX: CanvasRenderingContext2D = GAME.getCtx()

const PLAYER: Player = new Player(0, 0, 40, 40, 2.5, CTX)


const ENEMY_ENTITIES: Entity[] = [
    new Entity(50, 50, 40, 40, CTX),
    new Entity(250, 200, 80, 40, CTX),

    new Entity(600, 200, 80, 40, CTX),
    new Entity(680, 200, 40, 120, CTX),
]
const SURFACE_ENTITIES: Entity[] = [
    new Entity(400, 200, 80, 40, CTX),
    new Entity(400, 200, 80, 40, CTX),
    new Entity(100, 300, 80, 40, CTX)
]


let blockedKeys: MoveKeys[] = []


GAME.setWidth(800, 600)

GAME.update(() => {
    PLAYER.draw('#000')

    for (const ent of ENEMY_ENTITIES)
        ent.draw('red')

    for (const ent of SURFACE_ENTITIES)
        ent.draw('green')


    PLAYER.checkCollision(SURFACE_ENTITIES, collidedWithSurface, resetBlockKey)
    PLAYER.checkCollision(ENEMY_ENTITIES, collidedWithEnemy)
    PLAYER.handleCanvasCollision(blockedKeys, GAME.getCanvasStats())


    PLAYER.handleStandardMoveKeys(blockedKeys)        
})


PLAYER.initPressKeyEvents()


// --------------- Funcs ------------------


// Resets the array of blocked keys
const resetBlockKey = (): void => {
    blockedKeys = []
}


// When collided with a wall/floor
const collidedWithSurface = (ent: Entity): void => {
    const key: MoveKeys | undefined = PLAYER.getCollisionStopKey(ent.getStats())

    if (key)
        blockedKeys.push(key)
}


// Game over
const collidedWithEnemy = (): void => {
    // PLAYER.setPlayerPos(0, 0)

    console.log('Game over')
    PLAYER.changePlayerMovementStatus(false)
}