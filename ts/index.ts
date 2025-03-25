import Entity from "../ts/entities/Entity.js"
import Game from "../ts/Game.js"
import Item from "../ts/entities/Item.js"
import Platform from "../ts/entities/Platform.js"
import Player from "../ts/entities/Player.js"
import Score from "../ts/entities/Score.js"
import { Bullet, Maybe, Platforms, WeaponCommon } from "../interfaces/EntityTypes.js"
import { EntityType, Level } from "../interfaces/GameTypes.js"
import Action from "./entities/Action.js"
import Enemy from "./entities/Enemy.js"
import { ActivationObject } from "../interfaces/PlayerTypes.js"
import WeaponItem from "./entities/WeaponItem.js"
import Ammo from "./entities/Ammo.js"
import Exit from "./Exit.js"
import getLevels from "../levels/Levels.js"


// ---------------------- ELEMENTS -------------------------

const health_bar:     HTMLElement      = document.querySelector('section.health div.bar div') as HTMLElement,
      health_txt:     Element          = document.querySelector('section.health p')!,
      weapon_img:     HTMLImageElement = document.querySelector('aside.eq section.weapon img') as HTMLImageElement,
      ammo_curr:      HTMLElement      = document.querySelector('.ammo .mag p.nr') as HTMLElement,
      ammo_total:     HTMLElement      = document.querySelector('.ammo .total p.nr') as HTMLElement,
      ammo_total_bar: HTMLElement      = document.querySelector('.ammo .total .bar div') as HTMLElement,
      ammo_curr_bar:  HTMLElement      = document.querySelector('.ammo .mag .bar div') as HTMLElement

// --------------------------------------------------------

// ---------------------- CONSTS --------------------------

const GAME: Game = new Game(800, 600),
      CTX:  CanvasRenderingContext2D = GAME.getCtx()

const DEFAULT_SPEED: number = 3,
      DEFAULT_JUMP:  number = 5,
      EQ_COOLDOWN:   number = 200

// --------------------------------------------------------


// -------------------- ENTITIES --------------------------

const PLAYER: Player = new Player(210, 30, 40, 40, DEFAULT_SPEED, DEFAULT_JUMP, {
    weapon: new WeaponItem(0, 0, 'rocketlauncher').getWeaponStats(),
    // weapon: new WeaponItem(0, 0, 'smg').getWeaponStats(),
    // weapon: new WeaponItem(0, 0, 'shotgun').getWeaponStats(),
    // weapon: new WeaponItem(0, 0, 'pistol').getWeaponStats(),
    game: GAME
})

// ------------------------------------------------------

// ------------------- VARIABLES --------------------------

let g_initPlayerPos: boolean      = false,
    g_item_toggle:   boolean      = true,
    g_stopped:       boolean      = false,
    g_healthbefore:  number       = 0,
    g_currentLevel:  Maybe<Level> = null,
    g_collidedE:     Maybe        = null

// --------------------------------------------------------

const init = () => {
    if (GAME.insufficientScreenHandler())
        return
    
    initLevels()
    
    GAME.update(() => {
        if (g_currentLevel)
        {
            const { enemies, scores, surfaces, platforms, items, weapons, ammo, exit } = g_currentLevel
    
    
            if (!g_initPlayerPos)
            {
                PLAYER.setPosition(g_currentLevel.player.x, g_currentLevel.player.y)
                g_initPlayerPos = true
            }
    


            for (const ent of surfaces)
                ent.draw(CTX, '#3a8cf3')
    
            for (const ent of [...scores, ...platforms, ...items, ...weapons, ...ammo] as Entity[])
                ent.draw(CTX)
    
            for (const shooter of [...enemies, PLAYER] as Action[])
            {
                shooter.draw(CTX)
    
                // Enemy shoot
                if (shooter instanceof Enemy)
                    shooter.shoot()
    
                // Each bullet
                for (const bullet of shooter.getShots() as Bullet[])
                {
                    shooter.drawShot(CTX, bullet)
    
                    // Bullet collided with a surface
                    bullet.obj.checkCollision(surfaces, () => shooter.removeBullet(bullet.obj))
    
                    // Bullet collided with a canvas
                    if (GAME.isCollided(bullet.obj).length)
                        shooter.removeBullet(bullet.obj)
    
                    if (shooter instanceof Enemy)
                    {
                        // Enemy bullet
                        bullet.obj.checkCollision<Player>([PLAYER], (player: Player) => {
                            shooter.removeBullet(bullet.obj)
                            shooter.deal_damage(player, bullet)
                        })
                    }
    
                    else if (shooter instanceof Player)
                    {
                        // Player bullet
                        bullet.obj.checkCollision<Action>([...enemies, PLAYER], (enemy: Action) => {
                            shooter.removeBullet(bullet.obj)
    
                            // Remove an enemy
                            if (shooter.deal_damage(enemy, bullet))
                                removeEntity('enemies', enemy.getStats().id)
                        })
                    }
                }
            }

            if (GAME.havePointsBeenCollected()) 
            {
                for (const e of exit) e.draw(CTX)

                PLAYER.checkCollision(exit, collidedWithExit)
            }

    
            if (g_stopped) return
    
            PLAYER.handleGravity(PLAYER.checkCollision(surfaces), GAME.getCanvasStats())
            PLAYER.resetBlockedKeys()
    
            PLAYER.checkCollision(platforms, collidedWithPlatform, unCollidedWithPlatform)
            PLAYER.checkCollision(enemies,   collidedWithEnemy,    unCollidedWithEnemy)
            PLAYER.checkCollision(surfaces,  collidedWithSurface)
            PLAYER.checkCollision(scores,    collidedWithScore)
            PLAYER.checkCollision(weapons,   collidedWithWeapon)
            PLAYER.checkCollision(items,     collidedWithItem)
            PLAYER.checkCollision(ammo,      collidedWithAmmo)
    
            PLAYER.handleCanvasCollision(GAME.isCollided(PLAYER), GAME.getCanvasStats())
    
            updateHealth()
            reloadDisplay()
    
            if (PLAYER.getStats().health <= 0)
                player_dead_handler()
    
            PLAYER.handleAdvancedMoveKeys()
        }
    })
    
    GAME.updateScoreText()
        
    PLAYER.initPressKeyEvents()
    PLAYER.addBinding('item_scroll-backwards', ['q'], () => activeItemSelector(true))
    PLAYER.addBinding('item_scroll-forwards',  ['e'], () => activeItemSelector())
    PLAYER.addBinding('item_drop',             ['z'], () => itemDrop())
    PLAYER.addBinding('player_shoot',          ['x'], () => playerShoot())
    PLAYER.addBinding('reload_weapon',         ['r'], () => PLAYER.reload(displayAmmo))
    
    displayWeapon()
    displayAmmo()
}


PLAYER.addBinding('item_use', ['f'], () => {
    const [eq, i] = getActiveIndex()

    if (eq && i !== -1 && PLAYER.items[i])
    {
        const obj: ActivationObject = {
            init_jump:   DEFAULT_JUMP,
            init_speed:  DEFAULT_SPEED
        }

        if ( !PLAYER.items[i]?.activate(PLAYER, obj) )
            return

        PLAYER.clearItem(i)

        activeItemToggler(i, eq)
        displayItems()
    }
})

/*
    
*/

// --------------- Funcs ------------------

document.querySelector('img.sound-icon')?.addEventListener('click', (e: Event) => {
    const t: HTMLImageElement = e.target as HTMLImageElement

    t.src = GAME.toggleAudio() ? '/data/sound_off.svg' : '/data/sound_on.svg'
})

document.querySelector('.i-github')?.addEventListener('click', () => window.open('https://github.com/vrecek', '_blank'))


const getActiveIndex = (): [Element[] | null, number] => {
    if (!g_item_toggle) 
        return [null, -1]

    g_item_toggle = false
    setTimeout(() => g_item_toggle = true, EQ_COOLDOWN);

    const eq: Element[] = [...document.querySelector('aside.eq section.items section')!.children]
    let   i:  number    = eq.findIndex(x => x.classList.contains('active'))

    return [eq, i]
}


const displayItems = (): void => {
    const eq: Element[] = [...document.querySelector('aside.eq section.items section')!.children]

    for (let i = 0; i < PLAYER.items.length; i++)
    {
        const img: HTMLImageElement = eq[i].children[0] as HTMLImageElement
        img.src = ""

        if (PLAYER.items[i])
            img.src = PLAYER.items[i]!.getStats().img!
    }
}


const displayWeapon = (): void => {
    weapon_img.src = PLAYER.getWeaponDefaults()?.img ?? ''
}


const reloadDisplay = (): void => {
    if (PLAYER.getWeapon()?.is_reloading)
        PLAYER.reloadIndicator(CTX)
}


const displayAmmo = (): void => {
    const sw: Maybe<WeaponCommon> = PLAYER.getWeapon()?.stats,
          sd: Maybe<WeaponCommon> = PLAYER.getWeaponDefaults()?.stats

    const mag: string = `${sw?.mag_ammo   ?? '-'}`,
          tot: string = `${sw?.total_ammo ?? '-'}`

    let bc: number = 0,
        bt: number = 0


    if (sw && sd)
    {
        bc = calcBarPercent(sw.mag_ammo, sd.mag_ammo)
        bt = calcBarPercent(sw.total_ammo, sd.total_ammo)
    }

    ammo_curr.textContent      = `${mag}`
    ammo_total.textContent     = `${tot}`
    ammo_curr_bar.style.width  = `${bc}%`
    ammo_total_bar.style.width = `${bt}%`
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


const playerShoot = (): void => {
    PLAYER.shoot(displayAmmo)
    displayAmmo()
}


const activeItemSelector = (backwards?: boolean): boolean => {
    const [eq, i] = getActiveIndex()

    if (!eq || i === -1) return false

    activeItemToggler(i, eq, backwards)

    return true
}

// ------------------- COLLISION FNS -----------------------

const collidedWithExit = (exit: Exit): void => {
    removeEntity('exit', exit.getStats().id)

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


const collidedWithWeapon = (weapon: WeaponItem): void => {
    removeEntity('weapons', weapon.getStats().id)

    PLAYER.setWeapon(weapon.getWeaponStats())
    displayWeapon()
    displayAmmo()
}


const collidedWithAmmo = (ammo: Ammo): void => {
    const pw: Maybe<WeaponCommon> = PLAYER.getWeapon()?.stats

    if (!pw || pw.total_ammo === pw.max_ammo)
        return

    removeEntity('ammo', ammo.getStats().id)

    PLAYER.addAmmo(ammo.getAmmoCount() || PLAYER.getWeaponDefaults()!.stats.mag_ammo)
    
    displayAmmo()
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


const collidedWithScore = (score: Score): void => {
    GAME.updateScoreText(1)
    removeEntity('scores', score.getStats().id)
}


const collidedWithSurface = (ent: Entity): void => {
    PLAYER.stopCollisionMovement(ent)
}


const collidedWithEnemy = (enemy: Entity): void => {
    if (PLAYER.isEffectActive('invincibility'))
    {
        if (!g_collidedE)
        {
            g_collidedE = enemy.getStats().id
            PLAYER.setImage("/data/player/player_immortal.svg")
        }

        return
    }

    PLAYER.set_health(0)
}


const unCollidedWithEnemy = (): void => {
    g_collidedE = null
    PLAYER.setImage("/data/player/player.svg")
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

// --------------------------------------------------------


const removeEntity = (type: EntityType, id: string): void => {
    g_currentLevel![type] = PLAYER.delete_entity(g_currentLevel![type], id)
}


const player_dead_handler = (): void => {
    g_stopped = true

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
        PLAYER.loadWeapon()
        PLAYER.set_health(PLAYER.getStats().def_health)

        s.remove()
        displayItems()
        displayWeapon()
        displayAmmo()
        toggleEnemyAnimation(true);
        proceedToNextLevel(GAME.loadLevel('current')!)
        
        g_stopped = false
    }

    d.append(b1, b2)
    s.append(h3, d)

    document.body.append(s)
}


const updateHealth = (): void => {
    const {health, def_health} = PLAYER.getStats()

    if (health === g_healthbefore)
        return

    if (health <= 0 && PLAYER.isEffectActive('invincibility'))
        PLAYER.set_health(1)

    let perc: number = calcBarPercent(health, def_health)

    if (perc < 0) 
        perc = 0

    g_healthbefore = health

    health_bar.style.width = `${perc}%`
    health_txt.textContent = `${perc}`
}


const proceedToNextLevel = (nextLevel: Level): void => {
    document.querySelector('h3')?.remove()

    PLAYER.setPlayerSpeed(DEFAULT_SPEED)
    PLAYER.saveEquipment()
    PLAYER.saveWeapon()
    PLAYER.resetJumpState()
    
    g_initPlayerPos = false
    g_currentLevel  = nextLevel

    GAME.unlockLevel(GAME.getCurrentLevel())
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


const calcBarPercent = (curr: number, total: number): number => (100 * curr) / total


const initLevels = (): void => {
    const lvl: Maybe<number> = +localStorage.getItem('init_lvl')!
    
    GAME.setLevels(getLevels(GAME))
    g_currentLevel = GAME.loadLevel(lvl+1)

    localStorage.removeItem('init_lvl')
}


init()