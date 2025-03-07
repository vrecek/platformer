import Entity from "./Entity"
import { CanvasStats, Level, LevelLoader, VoidFn } from "./interfaces/GameTypes"


class Game
{
    private canvas:      HTMLCanvasElement
    private ctx:         CanvasRenderingContext2D

    private level:       number
    private levels:      Level[]

    private points:      number
    private totalPoints: number


    public constructor(levels: Level[])
    {
        this.canvas = document.querySelector('canvas')!
        this.ctx    = this.canvas.getContext('2d')!

        this.levels = levels

        this.level       = 1
        this.points      = 0
        this.totalPoints = 0
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


    public update(fn: VoidFn): void
    {
        const refresh = () => {
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


    public updateLevelStats(level: number, totalPoints: number)
    {
        this.level       = level
        this.totalPoints = totalPoints

        this.updateScoreText()
    }


    public hasLevelBeenFinished(): boolean
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

        return newLevel ? {...newLevel} : null
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