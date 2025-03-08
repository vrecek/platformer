import Entity from "../ts/entities/Entity.js"
import Game from "../ts/Game.js"
import Item from "../ts/entities/Item.js"
import Platform from "../ts/entities/Platform.js"
import Player from "../ts/entities/Player.js"
import Score from "../ts/entities/Score.js"
import { Bullet, CollisionCb, Maybe, Platforms } from "../interfaces/EntityTypes.js"
import { EntityType, Level } from "../interfaces/GameTypes.js"
import LEVELS from "../levels/Levels.js"
import Action from "./entities/Action.js"
import Enemy from "./entities/Enemy.js"
import { ActivationObject } from "../interfaces/PlayerTypes.js"


// ---------------------- CONSTS --------------------------

const GAME: Game = new Game(LEVELS),
      CTX:  CanvasRenderingContext2D = GAME.getCtx()

const DEFAULT_SPEED:  number = 3,
      DEFAULT_JUMP:   number = 5,
      DEFAULT_ATTCD:  number = 500,
      DEFAULT_BLTSPD: number = 6,
      DEFAULT_ATTDMG: number = 1,
      EQ_COOLDOWN:    number = 200

// --------------------------------------------------------


// -------------------- ENTITIES --------------------------

const PLAYER: Player = new Player(210, 30, 40, 40, DEFAULT_SPEED, DEFAULT_JUMP, {
    bullet_dmg:   DEFAULT_ATTDMG,
    bullet_speed: DEFAULT_BLTSPD,
    shoot_cd:     DEFAULT_ATTCD,
    health:       10
})

// ------------------------------------------------------


// ------------------- VARIABLES --------------------------

let g_initPlayerPos: boolean      = false,
    g_item_toggle:   boolean      = true,
    g_currentLevel:  Maybe<Level> = GAME.loadLevel('current'),
    g_collidedE:     Maybe        = null

// --------------------------------------------------------


GAME.setWidth(800, 600)

GAME.update(() => {
    if (g_currentLevel)
    {
        const { enemies, scores, surfaces, platforms, items } = g_currentLevel

        if (!g_initPlayerPos)
        {
            PLAYER.setPosition(g_currentLevel.player.x, g_currentLevel.player.y)
            g_initPlayerPos = true
        }


        for (const ent of surfaces)
            ent.draw(CTX, '#3a8cf3')

        for (const ent of [...scores, ...platforms, ...items] as Entity[])
            ent.draw(CTX)

        for (const ent of [...enemies, PLAYER] as Action[])
        {
            ent.draw(CTX)

            for (const b of ent.getShots() as Bullet[])
            {
                ent.drawShot(CTX, b)

                b.obj.checkCollision(surfaces, () => ent.removeBullet(b.obj))
                b.obj.checkCollision<Enemy>(enemies, (e: Enemy) => {
                    ent.removeBullet(b.obj)

                    if (PLAYER.deal_damage(e))
                        removeEntity('enemies', e.getStats().id)
                })
            }
        }

        PLAYER.handleGravity(PLAYER.checkCollision(surfaces), GAME.getCanvasStats())
        PLAYER.resetBlockedKeys()

        PLAYER.checkCollision(platforms, collidedWithPlatform, unCollidedWithPlatform)
        PLAYER.checkCollision(enemies, collidedWithEnemy, unCollidedWithEnemy)
        PLAYER.checkCollision(surfaces, collidedWithSurface)
        PLAYER.checkCollision(scores, collidedWithScore)
        PLAYER.checkCollision(items, collidedWithItem as CollisionCb)

        PLAYER.handleCanvasCollision(GAME.getCanvasStats())

        PLAYER.handleAdvancedMoveKeys()
    }
})

/* 
LEFT:
health (space-between: top-middle-bottom)

RIGHT:
top-middle-bottom
bottom gitbub
top label
middle buttons

*/

GAME.updateLevelStats(1, g_currentLevel?.scores.length ?? 0)
GAME.insufficientScreenHandler()
    
PLAYER.initPressKeyEvents()


PLAYER.addBinding('item_scroll-backwards', ['q'], () => activeItemSelector(true))
PLAYER.addBinding('item_scroll-forwards',  ['e'], () => activeItemSelector())
PLAYER.addBinding('item_drop',             ['z'], () => itemDrop())
PLAYER.addBinding('player_shoot',          ['x'], () => PLAYER.shoot())

PLAYER.addBinding('item_use', ['f'], () => {
    const [eq, i] = getActiveIndex()

    if (eq && i !== -1 && PLAYER.items[i])
    {
        const obj: ActivationObject = {
            init_jump:   DEFAULT_JUMP,
            init_speed:  DEFAULT_SPEED,
            init_attcd:  DEFAULT_ATTCD,
            init_attdmg: DEFAULT_ATTDMG,
            init_bltspd: DEFAULT_BLTSPD
        }

        if ( !PLAYER.items[i]?.activate(PLAYER, obj) )
            return

        PLAYER.clearItem(i)

        activeItemToggler(i, eq)
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


const getActiveIndex = (): [Element[] | null, number] => {
    if (!g_item_toggle) 
        return [null, -1]

    g_item_toggle = false
    setTimeout(() => g_item_toggle = true, EQ_COOLDOWN);

    const eq: Element[] = [...document.querySelector('aside.eq section.items')!.children]
    let   i:  number    = eq.findIndex(x => x.classList.contains('active'))

    return [eq, i]
}


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


const activeItemToggler = (i: number, eq: Element[], backwards?: boolean): void => {
    eq[i].classList.remove('active')
    
    if (backwards)
        i = eq[i-1] ? i-1 : eq.length-1
    else
        i = eq[i+1] ? i+1 : 0

    eq[i].classList.add('active')
}


const itemDrop = (): void => {
    const [eq, i] = getActiveIndex()

    if (!eq || i === -1) return

    if (PLAYER.items[i])
    {
        PLAYER.clearItem(i)
        activeItemToggler(i, eq)
        displayItems()
    }
}


const activeItemSelector = (backwards?: boolean): boolean => {
    const [eq, i] = getActiveIndex()

    if (!eq || i === -1) return false

    activeItemToggler(i, eq, backwards)

    return true
}


const collidedWithItem = (item: Item): void => {
    if (PLAYER.items.every(x => x)) 
        return

    const i: number = PLAYER.items.findIndex(x => !x)
    PLAYER.setItem(i, item)

    removeEntity('items', item.getStats().id)
    
    displayItems()
}


const collidedWithPlatform = (platform: Platform): void => {
    switch (platform.getStats().name as Platforms)
    {
        case 'jump':
            const current_power: number = PLAYER.getStats().jump_power

            if (PLAYER.isEffectActive('speed', true))
                Item.zeroEffectContainer(PLAYER, 'speed')

            PLAYER.setPlayerJumpPower(10)
            PLAYER.setPlayerSpeed(DEFAULT_SPEED)
            PLAYER.jump()

            PLAYER.setPlayerJumpPower(PLAYER.isEffectActive('jumpboost') ? current_power : DEFAULT_JUMP)

            break

        case 'speed':
            if (PLAYER.isEffectActive('speed'))
                return

            PLAYER.addActiveEffect(['speed'])
            PLAYER.setPlayerSpeed(DEFAULT_SPEED * 2)

            break
    }        
}


const unCollidedWithPlatform = (platform: Platform): void => {
    switch (platform.getStats().name)
    {
        case 'speed':
            if (PLAYER.isEffectActive('speed', true))
                return

            PLAYER.removeActiveEffect('speed')
            PLAYER.setPlayerSpeed(DEFAULT_SPEED)

            break
    }
}


const removeEntity = (type: EntityType, id: string): void => {
    g_currentLevel![type] = PLAYER.delete_entity(g_currentLevel![type], id)
}


const collidedWithScore = (score: Score): void => {
    GAME.updateScoreText(1)
    removeEntity('scores', score.getStats().id)

    if (GAME.hasLevelBeenFinished()) 
    {
        const nextLevel: Level | null = GAME.loadLevel('next')

        if (nextLevel)
        {
            removeAllEffects()
            proceedToNextLevel(nextLevel)
        }
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


const unCollidedWithEnemy = (): void => {
    g_collidedE = null
    PLAYER.setImage("/data/player/player.svg")
}


const collidedWithEnemy = (enemy: Entity): void => {
    if (document.querySelector('h3')) return

    if (PLAYER.isEffectActive('invincibility'))
    {
        if (!g_collidedE)
        {
            g_collidedE = enemy.getStats().id
            PLAYER.setImage("/data/player/player_immortal.svg")
        }

        return
    }

    removeAllEffects()

    PLAYER.changePlayerMovementStatus(false)
    PLAYER.setImage("/data/player/player_dead.svg")
    toggleEnemyAnimation(false)

    showLoseScreen()
}


const showLoseScreen = (): void => {
    const s:  HTMLElement = document.createElement('section'),
          h3: HTMLElement = document.createElement('h3'),
          d:  HTMLElement = document.createElement('div'),
          b1: HTMLElement = document.createElement('button'),
          b2: HTMLElement = document.createElement('button')

    s.className = 'lost'

    h3.textContent = "You lost"
    b1.textContent = 'Restart'
    b2.textContent = 'Menu'

    b1.onclick = () => {
        PLAYER.changePlayerMovementStatus(true)
        PLAYER.setImage("/data/player/player.svg")
        PLAYER.loadEquipment()

        s.remove()
        displayItems()
        toggleEnemyAnimation(true)
        proceedToNextLevel(GAME.loadLevel('current')!)
    }

    d.append(b1, b2)
    s.append(h3, d)

    document.body.append(s)
}


const proceedToNextLevel = (nextLevel: Level): void => {
    document.querySelector('h3')?.remove()

    PLAYER.setPlayerJumpPower(DEFAULT_JUMP)
    PLAYER.setPlayerSpeed(DEFAULT_SPEED)
    PLAYER.saveEquipment()
    PLAYER.resetJumpState()
    
    g_initPlayerPos = false
    g_currentLevel  = nextLevel

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
    for (const ent of g_currentLevel?.enemies ?? [])
        ent.toggleAnimation(val)
}


const removeAllEffects = (): void => {
    for (const x of PLAYER.getActiveEffects())
        Item.zeroEffectContainer(PLAYER, x)
}