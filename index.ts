import Entity from "./Entity.js"
import Game from "./Game.js"
import Player from "./Player.js"
import { Maybe } from "./interfaces/EntityTypes.js"
import { Level } from "./interfaces/GameTypes.js"
import LEVELS from "./levels/Levels.js"



const GAME:     Game = new Game(LEVELS),
      CTX:      CanvasRenderingContext2D = GAME.getCtx(),
      resetBtn: HTMLButtonElement = document.querySelector('button.reset')!;

const DEFAULT_SPEED: number = 3,
      DEFAULT_JUMP:  number = 5

// -------------------- ENTITIES --------------------------

const PLAYER: Player = new Player(210, 30, 40, 40, DEFAULT_SPEED, DEFAULT_JUMP)

// ------------------------------------------------------

let initPlayerPos: boolean      = false
let currentLevel:  Maybe<Level> = GAME.loadLevel('current')
let collidedID:    Maybe        = null


GAME.setWidth(800, 600)

GAME.update(() => {
    if (currentLevel)
    {
        const { enemies, scores, surfaces, platforms } = currentLevel

        if (!initPlayerPos)
        {
            PLAYER.setPlayerPos(currentLevel.player.x, currentLevel.player.y)
            initPlayerPos = true
        }

        for (const ent of enemies)
            ent.draw(CTX, 'red')

        for (const ent of surfaces)
            ent.draw(CTX, 'green')

        for (const ent of scores)
            ent.draw(CTX, 'royalblue')

        for (const ent of platforms)
            ent.draw(CTX)


        PLAYER.draw(CTX)

        PLAYER.handleGravity(PLAYER.checkCollision(surfaces), GAME.getCanvasStats())
        PLAYER.resetBlockedKeys()

        PLAYER.checkCollision(platforms, collidedWithPlatform, unCollidedWithPlatform)
        PLAYER.checkCollision(enemies, collidedWithEnemy)
        PLAYER.checkCollision(surfaces, collidedWithSurface)
        PLAYER.checkCollision(scores, collidedWithScore)

        PLAYER.handleCanvasCollision(GAME.getCanvasStats())

        PLAYER.handleAdvancedMoveKeys()
    }
})


GAME.updateLevelStats(1, currentLevel?.scores.length ?? 0)
PLAYER.initPressKeyEvents()

GAME.insufficientScreenHandler()


// --------------- Funcs ------------------

document.querySelector('section.lvl button')?.addEventListener('click', (e: Event) => {
    const i = document.querySelector('input.lvlinput') as HTMLInputElement

    if (typeof +i.value === undefined) return

    const l = GAME.loadLevel(+i.value)

    if (l)
        proceedToNextLevel(l)
})


resetBtn?.addEventListener('click', () => {
    PLAYER.changePlayerMovementStatus(true)
    PLAYER.setPlayerImage("/data/player.svg")
    toggleEnemyAnimation(true)

    proceedToNextLevel( GAME.loadLevel('current')! )
})


const collidedWithPlatform = (platform: Entity): void => {
    collidedID = platform.getStats().id

    switch (platform.getStats().name)
    {
        case 'jump':
            PLAYER.setPlayerJumpPower(10)
            PLAYER.jump()
            PLAYER.setPlayerJumpPower(DEFAULT_JUMP)
            break

        case 'speed':
            PLAYER.setPlayerSpeed(DEFAULT_SPEED * 2)
            break
    }        
}


const unCollidedWithPlatform = (platform: Entity): void => {
    if (platform.getStats().id === collidedID)
    {
        collidedID = null
        
        switch (platform.getStats().name)
        {
            case 'speed':
                PLAYER.setPlayerSpeed(DEFAULT_SPEED)
                break
        }
    }
}


const collidedWithScore = (score: Entity): void => {
    GAME.handleGettingScore(currentLevel!, score)

    if (GAME.hasLevelBeenFinished()) 
    {
        const nextLevel: Level | null = GAME.loadLevel('next')

        if (nextLevel)
            proceedToNextLevel(nextLevel)
        else 
            showFinishScreen()
    }
}


const collidedWithSurface = (ent: Entity): void => {
    PLAYER.stopCollisionMovement(ent)
}



const collidedWithEnemy = (): void => {
    if (document.querySelector('h3')) 
        return

    PLAYER.changePlayerMovementStatus(false)
    PLAYER.setPlayerImage("/data/player_mad.svg")
    toggleEnemyAnimation(false)

    const h3: Element = document.createElement('h3')
    h3.textContent    = 'You lost'

    document.body.appendChild(h3)
}


const proceedToNextLevel = (nextLevel: Level): void => {
    document.querySelector('h3')?.remove()
    
    initPlayerPos = false
    currentLevel  = nextLevel

    GAME.updateScoreText()
}


const showFinishScreen = (): void => {
    document.body.textContent = null

    const h1: Element = document.createElement('h1')
    h1.textContent = 'You have finished the game'

    const btnRestart: HTMLButtonElement = document.createElement('button')
    btnRestart.textContent = 'Restart'
    btnRestart.onclick     = () => window.location.reload()

    const a: HTMLAnchorElement = document.createElement('a')
    a.textContent = 'Source code'
    a.href        = 'https://github.com/vrecek/platformer'
    a.target      = '_blank'

    const finishWrapper: Element = document.createElement('section')
    finishWrapper.className = 'finish-wrapper'
    finishWrapper.appendChild(h1)
    finishWrapper.appendChild(btnRestart)
    finishWrapper.appendChild(a)

    document.body.appendChild(finishWrapper)
}


const toggleEnemyAnimation = (val: boolean): void => {
    for (const ent of currentLevel?.enemies ?? [])
        ent.toggleAnimation(val)
}