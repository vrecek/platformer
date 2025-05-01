import { Maybe } from "../interfaces/EntityTypes"
import { Achievement, AudioObject, CanvasStats, CollisionValues, GameDates, GameFunctions, GameTimeouts, Level, LevelLoader, VoidFn } from "../interfaces/GameTypes"
import Entity from "./entities/Entity"
import Player from "./entities/Player"


class Game
{
    private static fns:   GameFunctions[] = []
    private static tms:   GameTimeouts[]  = []
    private static dates: GameDates[]     = []

    private paused: boolean
    private canvas: HTMLCanvasElement
    private ctx:    CanvasRenderingContext2D

    private level:        number
    private levels:       Level[]
    private achievements: Achievement[]

    private points:      number
    private totalPoints: number

    private muted:       boolean
    private audios:      AudioObject[]


    public constructor(w?: number, h?: number, levels?: Level[])
    {
        this.paused = false
        this.canvas = document.querySelector('canvas')!
        this.ctx    = this.canvas?.getContext('2d')!

        if (w && h) this.setWidth(w, h)

        this.muted  = true
        this.audios = []

        this.levels = [...(levels ?? [])]

        this.level       = levels ? 1 : 0
        this.points      = 0
        this.totalPoints = 0

        this.achievements = [
            {
                img: '/data/items/item_invincibility.svg',
                title: 'Hunter I',
                txt: 'Destroy your first enemy',
                type: 'enemykill',
                pred: (plr: Player) => plr.getKilledEnemies() >= 1
            },
            {
                img: '/data/items/item_invincibility.svg',
                title: 'Hunter II',
                txt: 'Destroy 50 enemies',
                type: 'enemykill',
                pred: (plr: Player) => plr.getKilledEnemies() >= 50
            },
            {
                img: '/data/items/item_invincibility.svg',
                title: 'Grave I',
                txt: 'Die 10 times',
                type: 'dying',
                pred: () => false
            },
            {
                img: '/data/items/item_invincibility.svg',
                title: 'Grave II',
                txt: 'Die 100 times',
                type: 'dying',
                pred: () => false
            },
            {
                img: '/data/player/player_dead.svg',
                title: 'Unexpected casuality',
                txt: 'Die from your own weapon',
                type: 'dyingself',
                pred: () => true
            },
            {
                img: '/data/bullets.svg',
                title: 'Shooter I',
                txt: 'Fire 100 bullets',
                type: 'firing',
                pred: (plr: Player) => plr.getFiredShots() >= 100
            },
            {
                img: '/data/bullets.svg',
                title: 'Shooter II',
                txt: 'Fire 2000 bullets',
                type: 'firing',
                pred: (plr: Player) => plr.getFiredShots() >= 2000
            },
            {
                img: '/data/bullets.svg',
                title: 'Shooter III',
                txt: 'Fire 5000 bullets',
                type: 'firing',
                pred: (plr: Player) => plr.getFiredShots() >= 5000
            },
            {
                img: '/data/weapons/pistol.svg',
                title: 'Firearm',
                txt: 'Get your first weapon',
                type: 'weapon_get1',
                pred: () => true
            }
    
        ].map((x, i) => { return {...x, id: `${i}` } })

        const stored: string[] = Game.storage_load('unlocked_achievements') ?? []

        for (const x of this.achievements)
            if (stored.includes(x.id))
                Object.assign(x, {unlocked: true})
    }


    public static generateID(): string
    {
        return Math.random().toString().slice(2)
    }

    public static degToRad(deg: number): number
    {
        return deg * (Math.PI / 180)
    }

    public static triggerStaticFunctions(): void
    {
        for (const x of Game.fns)
            x.fn()
    }

    public static removeFunction(id: string): void
    {
        const i: number = this.fns.findIndex(x => x.id === id)
        
        i !== -1 && this.fns.splice(i, 1)
    }

    public static hasFunction(id: string): boolean 
    {
        return Game.fns.some(x => x.id === id)
    }

    public static addFunction(id: string, fn: VoidFn): void
    {
        Game.fns.push({ id, fn })
    }

    public static addTimer(fn: VoidFn, ms: number): number
    {
        const id: string = Game.generateID()

        const timeoutFunction: VoidFn = () => {
            fn()

            Game.tms = Game.tms.filter(x => x.id !== id)
        }

        const timer: number = setTimeout(timeoutFunction, ms);


        Game.tms.push({ timeleft: ms, fn: timeoutFunction, start: Date.now(), timer, id })
        
        return timer
    }

    public static getDynamicDate(id: string): number
    {
        const oldValue: Maybe<number> = this.dates.find(x => x.id === id)?.val

        if (oldValue) 
            return oldValue

        const newValue: number = Date.now()

        this.dates.push({ id, holdStart: 0, val: newValue })

        return newValue
    }

    public static removeDynamicDate(id: string): void
    {
        this.dates = this.dates.filter(x => x.id !== id)
    }

    public static storage_save(key: string, val: any): void
    {
        localStorage.setItem(key, JSON.stringify(val))
    }

    public static storage_load<T>(key: string): T
    {
        return JSON.parse(localStorage.getItem(key) ?? 'null')
    }

    public static storage_clear(key?: string): void
    {
        key ? localStorage.removeItem(key) : localStorage.clear()
    }

    

    public pause(): void
    {
        this.paused = true

        for (const x of Game.dates)
            x.holdStart = Date.now()

        for (const x of Game.tms)
        {
            clearTimeout(x.timer)

            x.timeleft -= (Date.now() - x.start)
        }
    }

    public resume(): void
    {
        this.paused = false

        for (const x of Game.dates)
            x.val += (Date.now() - x.holdStart)

        for (const x of Game.tms)
        {
            x.start = Date.now()
            x.timer = setTimeout(x.fn, x.timeleft)
        }
    }

    public is_paused(): boolean
    {
        return this.paused
    }

    public checkForAchievement(type: string, ...args: any): void
    {
        for (const x of this.achievements.filter(x => x.type === type && !x.unlocked))
        {
            if (x.pred(...args))
                this.unlockAchievement(x.id)
        }
    }

    public getAllAchievements(): [Achievement[], Achievement[]]
    {
        return [this.achievements, this.achievements.filter(x => x.unlocked)]
    }

    public unlockAchievement(id: string): void 
    {
        const prev: string[] = Game.storage_load('unlocked_achievements') ?? []

        if (!prev.includes(id) && this.achievements.some(x => x.id === id))
        {
            Game.storage_save('unlocked_achievements', [...prev, id])
            this.popupAchievement(id)
        }
    }

    public popupAchievement(id: string): void
    {
        const achievement: Maybe<Achievement> = this.achievements.find(x => x.id === id)

        if (!achievement) return

        const tag = ['section', 'p', 'section', 'figure', 'img', 'article', 'p', 'p'],
              [s1, p1, s2, f, i, a, p2, p3] = tag.map(x => document.createElement(x))

        s1.className = 'achievement-popup'

        p1.className   = 'header'
        p1.textContent = 'Achievement unlocked'

        ;(i as HTMLImageElement).src = achievement.img
        ;(i as HTMLImageElement).loading = 'lazy'

        p2.className   = 'title'
        p2.textContent = achievement.title

        p3.className   = 'text'
        p3.textContent = achievement.txt

        f.append(i)
        a.append(p2, p3)
        s2.append(f, a)
        s1.append(p1, s2)
        document.body.append(s1)

        setTimeout(() => s1.remove(), 4000);
    }

    public isCollided(ent: Entity): CollisionValues[]
    {
        const cw = this.canvas.width,
              ch = this.canvas.height,
              s  = ent.getStats()

        const vals: CollisionValues[] = []

        if (s.y <= 0)          vals.push('top')
        if (s.x <= 0)          vals.push('left')
        if ((s.y + s.h) >= ch) vals.push('bottom')
        if (s.x + s.w >= cw)   vals.push('right')

        return vals
    }

    public setWidth(w: number, h: number): void
    {
        this.canvas.width  = w
        this.canvas.height = h
    }

    public insufficientScreenHandler(): boolean
    {
        const MAX_W: number = 1280,
              MAX_H: number = 720

        if ( (window.innerWidth < MAX_W) || (window.innerHeight < MAX_H) )
        {
            document.body.textContent = null

            const h1: Element = document.createElement('h1')
            h1.textContent = "We're sorry!"

            const p1: Element = document.createElement('p')
            p1.textContent = "Your device is too small to display this game."

            const p2: Element = document.createElement('p')
            p2.textContent = `Minimum screen requirements: ${MAX_W}x${MAX_H}`

            const a: HTMLAnchorElement = document.createElement('a')
            a.textContent = 'Source code'
            a.href        = 'https://github.com/vrecek/platformer'
            a.target      = '_blank'

            const container: Element = document.createElement('section')
            container.className = 'screen-error'
            container.appendChild(h1)
            container.appendChild(p1)
            container.appendChild(p2)
            container.appendChild(a)

            document.body.appendChild(container)

            return true
        }

        return false
    }

    public audio(path: string): void
    {
        if (!path) return
        
        const a: HTMLAudioElement = new Audio(path),
              id: string          = Math.random().toString().slice(2)
        
        this.audios.push({ audio: a, path, id })

        a.onended = (): void => {
            const i: number = this.audios.findIndex(x => x.id === id)

            if (i !== -1)
                this.audios.splice(i, 1)
        }

        if (this.muted)
            a.volume = 0

        a.play()
    }

    public is_audio_playing(path: string): boolean
    {
        return this.audios.some(x => x.path === path)
    }

    public stop_audio(path: string): void
    {
        const i: number = this.audios.findIndex(x => x.path === path)

        if (i !== -1)
        {
            this.audios[i].audio.pause()
            this.audios[i].audio.currentTime = 0
            this.audios.splice(i, 1)
        }
    }

    public toggleAudio(): boolean
    {
        this.muted = !this.muted

        const vol: number = this.muted ? 0 : 1

        for (const x of this.audios)
            x.audio.volume = vol
        
        return this.muted
    }

    public unlockLevel(lvl: number): void
    {
        lvl--

        let lvls: number[] = Game.storage_load('unlocked_lvl')

        if (!lvls)
        {
            lvls    = [...new Array(this.levels.length).fill(0)]
            lvls[0] = 1
        }

        if (lvl >= lvls.length || lvls[lvl])
            return

        lvls[lvl] = 1

        Game.storage_save('unlocked_lvl', lvls)
    }

    public update(fn: VoidFn): void
    {
        const refresh = (): void => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            fn()

            window.requestAnimationFrame(refresh)
        }

        window.requestAnimationFrame(refresh)
    }

    public updateScoreText(points?: number): void
    {
        const lvl    = document.querySelector('h1')!,
              scores = document.querySelector('h2')!

        if (points)
            this.points += points

        lvl.textContent    = `Level ${this.level}`
        scores.textContent = `Score: ${this.points}/${this.totalPoints}`
    }

    public havePointsBeenCollected(): boolean
    {
        return this.points === this.totalPoints
    }

    public loadLevel(type: LevelLoader | number): Level | null
    {
        let newLevel: Level  | undefined,
            levelNr:  number | undefined


        if (typeof type === 'number')
        {
            newLevel = this.levels[type-1]
            levelNr  = type
        }
        else
        {
            const isCurrent: boolean = type === 'current'
            
            newLevel = this.levels[ this.level - (isCurrent ? 1 : 0) ]
            levelNr  = this.level + (isCurrent ? 0 : 1)
        }

        if (newLevel && levelNr)
        {
            this.level       = levelNr
            this.points      = 0
            this.totalPoints = newLevel.scores.length
        }

        return newLevel ? Object.assign(Object.create(Object.getPrototypeOf(newLevel)), newLevel) : null
    }

    public setLevels(levels: Level[]): void
    {
        this.levels = levels
        this.level  = 1
    }

    public getCurrentLevel(): number
    {
        return this.level
    }

    public getCtx(): CanvasRenderingContext2D
    {
        return this.ctx
    }

    public getCanvasStats(): CanvasStats
    {
        return {
            w: this.canvas.width,
            h: this.canvas.height
        }
    }
}


export default Game