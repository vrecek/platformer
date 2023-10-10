import Entity from "./Entity"
import { CanvasStats, Level, LevelLoader, VoidFn } from "./interfaces/GameTypes"


class Game {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D

    private level: number
    private levels: Level[]

    private points: number
    private totalPoints: number


    public constructor(levels: Level[]) {
        this.canvas = document.querySelector('canvas')!
        this.ctx = this.canvas.getContext('2d')!

        this.levels = levels

        this.level = 1
        this.points = 0
        this.totalPoints = 0
    }


    // Sets the canvas width
    public setWidth(w: number, h: number): void {
        this.canvas.width = w
        this.canvas.height = h
    }


    // Stop the game if the screen is too small
    public insufficientScreenHandler(): void {
        const resizeFunc = (): void => {
            if (
                (window.innerWidth < this.canvas.width) || 
                (window.innerHeight < this.canvas.height) 
            ) {
                window.onresize = null
                document.body.textContent = null

                const h1: Element = document.createElement('h1')
                h1.textContent = "We're sorry!"

                const p1: Element = document.createElement('p')
                p1.textContent = "Your device is to small to display this game."

                const p2: Element = document.createElement('p')
                p2.textContent = `Minimum screen requirements: ${this.canvas.width}x${this.canvas.height}`

                const a: HTMLAnchorElement = document.createElement('a')
                a.textContent = 'Source code'
                a.href = 'https://github.com/vrecek/platformer'
                a.target = '_blank'

                const container: Element = document.createElement('section')
                container.className = 'screen-error'
                container.appendChild(h1)
                container.appendChild(p1)
                container.appendChild(p2)
                container.appendChild(a)

                document.body.appendChild(container)
            }
        }

        resizeFunc()
        window.onresize = resizeFunc
    }


    // Update every frame
    public update(fn: VoidFn): void {
        const refresh = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

            fn()

            window.requestAnimationFrame(refresh)
        }

        window.requestAnimationFrame(refresh)
    }


    // Handle the score text
    public updateScoreText(points?: number): void {
        const lvl = document.querySelector('h1')!,
              scores = document.querySelector('h2')!

        if (points)
            this.points += points

        lvl.textContent = `Level ${ this.level }`
        scores.textContent = `Score: ${ this.points }/${ this.totalPoints }`
    }


    // Update the lvl statistics
    public updateLevelStats(level: number, totalPoints: number) {
        this.level = level
        this.totalPoints = totalPoints

        this.updateScoreText()
    }


    // Handles picking up the score
    public handleGettingScore(level: Level, ent: Entity): void {
        this.updateScoreText(1)
        
        level.scores = level.scores.filter(x => x.getStats().id !== ent.getStats().id)
    }


    // Checks if the player has gotten every point
    public hasLevelBeenFinished(): boolean {
        return this.points === this.totalPoints
    }


    // Get and set the level details
    public loadLevel(type: LevelLoader): Level | null {
        const isCurrent: boolean = type === 'current',
              newLevel: Level | null = this.levels[ this.level - (isCurrent ? 1 : 0) ]

        if (newLevel) {
            this.level += isCurrent ? 0 : 1
            this.points = 0
            this.totalPoints = newLevel.scores.length
        }

        return newLevel ? {...newLevel} : null
    }


    // Gets the current level
    public getCurrentLevel(): number {
        return this.level
    }


    // Returns the CTX
    public getCtx(): CanvasRenderingContext2D {
        return this.ctx
    }


    // Returns the ctx stats
    public getCanvasStats(): CanvasStats {
        return {
            w: this.canvas.width,
            h: this.canvas.height
        }
    }
}


export default Game