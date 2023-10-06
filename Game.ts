import { EntityStats } from "./interfaces/EntityTypes"
import { VoidFn } from "./interfaces/GameTypes"


class Game {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D


    public constructor() {
        this.canvas = document.querySelector('canvas')!
        this.ctx = this.canvas.getContext('2d')!
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


    // Returns the CTX
    public getCtx(): CanvasRenderingContext2D {
        return this.ctx
    }


    // Returns the ctx stats
    public getCanvasStats(): EntityStats {
        return {
            x: 0,
            y: 0,
            w: this.canvas.width,
            h: this.canvas.height
        }
    }
}


export default Game