import Entity from "./Entity"
import { CanvasStats, Level, VoidFn } from "./interfaces/GameTypes"


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
    public handleGettingScore(sc: Level, ent: Entity): void {
        this.updateScoreText(1)
        
        sc.scores.splice(
            sc.scores.findIndex( x => x.getStats().id === ent.getStats().id ), 
            1
        )
    }


    // Checks if the player has gotten every point
    public hasLevelBeenFinished(): boolean {
        return this.points === this.totalPoints
    }


    // Loads and sets up the next level
    public loadNextLevel(): Level | null {
        const nextLevel: Level | null = this.levels?.[this.level] ?? null

        if (nextLevel) {
            this.level++
            this.points = 0
            this.totalPoints = nextLevel.scores.length
        }

        return nextLevel
    }


    // Gets the current level
    public getCurrentLevel(): number {
        return this.level
    }


    // Gets the current level details
    public getCurrentLevelDetails(): Level | null {
        return this.levels?.[this.level - 1] ?? null
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