import Entity from "./Entity.js"
import Game from "./Game.js"
import Item from "./Item.js"
import Platform from "./Platform.js"
import Player from "./Player.js"
import Score from "./Score.js"
import { CollisionCb, Maybe, Platforms } from "./interfaces/EntityTypes.js"
import { Level } from "./interfaces/GameTypes.js"
import LEVELS from "./levels/Levels.js"



// ---------------------- CONSTS --------------------------

const GAME:     Game = new Game(LEVELS),
      CTX:      CanvasRenderingContext2D = GAME.getCtx(),
      resetBtn: HTMLButtonElement = document.querySelector('button.reset')!;

const DEFAULT_SPEED: number = 3,
      DEFAULT_JUMP:  number = 5

// --------------------------------------------------------


// -------------------- ENTITIES --------------------------

const PLAYER: Player = new Player(210, 30, 40, 40, DEFAULT_SPEED, DEFAULT_JUMP)

// ------------------------------------------------------


// ------------------- VARIABLES --------------------------

let initPlayerPos: boolean      = false,
    item_toggle:   boolean      = true,
    currentLevel:  Maybe<Level> = GAME.loadLevel('current'),
    collidedID:    Maybe        = null

// --------------------------------------------------------


GAME.setWidth(800, 600)

GAME.update(() => {
    if (currentLevel)
    {
        const { enemies, scores, surfaces, platforms, items } = currentLevel

        if (!initPlayerPos)
        {
            PLAYER.setPlayerPos(currentLevel.player.x, currentLevel.player.y)
            initPlayerPos = true
        }

        for (const ent of enemies)
            ent.draw(CTX, '#f71313')

        for (const ent of surfaces)
            ent.draw(CTX, '#3a8cf3')

        for (const ent of [...scores, ...platforms, ...items])
            ent.draw(CTX)


        PLAYER.draw(CTX)

        PLAYER.handleGravity(PLAYER.checkCollision(surfaces), GAME.getCanvasStats())
        PLAYER.resetBlockedKeys()

        PLAYER.checkCollision(platforms, collidedWithPlatform, unCollidedWithPlatform)
        PLAYER.checkCollision(enemies, collidedWithEnemy)
        PLAYER.checkCollision(surfaces, collidedWithSurface)
        PLAYER.checkCollision(scores, collidedWithScore)
        PLAYER.checkCollision(items, collidedWithItem as CollisionCb)

        PLAYER.handleCanvasCollision(GAME.getCanvasStats())

        PLAYER.handleAdvancedMoveKeys()
    }
})


GAME.updateLevelStats(1, currentLevel?.scores.length ?? 0)
GAME.insufficientScreenHandler()
    
PLAYER.initPressKeyEvents()


PLAYER.addBinding('item_scroll', ['q'], () => {
    if (!item_toggle) 
        return

    item_toggle = false

    const eq: Element[] = [...document.querySelector('aside.eq section.items')!.children]
    let   i:  number    = eq.findIndex(x => x.classList.contains('active'))

    i = itemActiveToggler(i, eq)

    setTimeout(() => item_toggle = true, 100);
})

PLAYER.addBinding('item_use', ['e'], () => {
    if (!item_toggle) 
        return

    item_toggle = false
    setTimeout(() => item_toggle = true, 100);

    const eq: Element[] = [...document.querySelector('aside.eq section.items')!.children]
    let   i:  number    = eq.findIndex(x => x.classList.contains('active'))

    if (PLAYER.items[i])
    {
        if ( !PLAYER.items[i]?.activate(PLAYER, DEFAULT_JUMP, DEFAULT_SPEED) )
            return

        PLAYER.items[i] = null

        i = itemActiveToggler(i, eq)
    
        displayItems()
    }
})


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


const displayItems = (): void => {
    const eq: Element[] = [...document.querySelector('aside.eq section.items')!.children]

    for (let i = 0; i < PLAYER.items.length; i++)
    {
        const img: HTMLImageElement = eq[i].children[0] as HTMLImageElement
        img.src = ""

        if (PLAYER.items[i])
            img.src = PLAYER.items[i]!.getStats().img!
    }
}


const itemActiveToggler = (i: number, eq: Element[]): number => {
    eq[i].classList.remove('active')
    
    i = eq[i+1] ? i+1 : 0

    eq[i].classList.add('active')

    return i
}


const collidedWithItem = (item: Item): void => {
    if (PLAYER.items.every(x => x)) 
        return

    const i: number = PLAYER.items.findIndex(x => !x)
    PLAYER.items[i] = item

    currentLevel!.items = currentLevel!.items.filter(x => x.getStats().id !== item.getStats().id)
    
    displayItems()
}


const collidedWithPlatform = (platform: Platform): void => {
    collidedID = platform.getStats().id

    switch (platform.getStats().name as Platforms)
    {
        case 'jump':
            PLAYER.setPlayerJumpPower(10)
            PLAYER.jump()
            PLAYER.setPlayerJumpPower(DEFAULT_JUMP)
            PLAYER.setPlayerSpeed(DEFAULT_SPEED)
            break

        case 'speed':
            PLAYER.setPlayerSpeed(DEFAULT_SPEED * 2)
            break
    }        
}


const unCollidedWithPlatform = (platform: Platform): void => {
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


const collidedWithScore = (score: Score): void => {
    GAME.handleGettingScore(currentLevel!, score)

    if (GAME.hasLevelBeenFinished()) 
    {
        const nextLevel: Level | null = GAME.loadLevel('next')

        if (nextLevel)
            proceedToNextLevel(nextLevel)
        else 
        {
            PLAYER.changePlayerMovementStatus(false)
            toggleEnemyAnimation(false) 
            showFinishScreen()
        }
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

    PLAYER.setPlayerJumpPower(DEFAULT_JUMP)
    PLAYER.setPlayerSpeed(DEFAULT_SPEED)

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