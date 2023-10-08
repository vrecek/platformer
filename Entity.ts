import { EntityStats } from "./interfaces/EntityTypes"

class Entity {
    protected id: string
    protected x: number
    protected y: number
    protected w: number
    protected h: number


    public constructor(x: number, y: number, w: number, h: number) {
        this.id = Math.random().toString().slice(2)

        this.x = x
        this.y = y
        this.w = w
        this.h = h
    }


    // Draw the entity as a rectangle
    public draw(color: string, ctx: CanvasRenderingContext2D, onlyBorders?: boolean) {
        ctx.beginPath()
        ctx.rect(this.x, this.y, this.w, this.h)

        if (onlyBorders) {
            ctx.strokeStyle = color
            ctx.stroke()

        } else {
            ctx.fillStyle = color
            ctx.fill()
        }
    }

    
    // Get the position and size
    public getStats(): EntityStats {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        }
    }
}


export default Entity