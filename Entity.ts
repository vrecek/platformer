import { EntityStats } from "./interfaces/EntityTypes"

class Entity {
    protected x: number
    protected y: number
    protected w: number
    protected h: number
    private ctx: CanvasRenderingContext2D


    public constructor(x: number, y: number, w: number, h: number, ctx: CanvasRenderingContext2D) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.ctx = ctx
    }


    // Draw the entity
    public draw(color: string) {
        this.ctx.beginPath()
        this.ctx.rect(this.x, this.y, this.w, this.h)
        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    // Get the position and size
    public getStats(): EntityStats {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }
}


export default Entity