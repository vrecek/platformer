import { AnimationArg, AnimationObject, AnimationPath, EntityStats } from "./interfaces/EntityTypes"

class Entity {
    protected id: string
    protected x: number
    protected y: number
    protected w: number
    protected h: number
    protected animation: AnimationObject | null


    public constructor(x: number, y: number, w: number, h: number, animPath?: AnimationArg) {
        this.id = Math.random().toString().slice(2)

        this.x = x
        this.y = y
        this.w = w
        this.h = h

        this.animation = animPath ? {
            speed: animPath.speed,
            shouldMove: true,
            moveLevel: 1,
            paths: [
                { x, y },
                ...animPath.paths
            ]
        } : null
    }


    // Handles the moving animation of an entity
    private animationHandler(arg: 'x' | 'y', currentPath: AnimationPath): void {
        if (!this.animation)
            return


        if (this[arg] !== currentPath[arg]) {
            if (this[arg] < currentPath[arg]) {
                this[arg] += this.animation.speed 

                if (this[arg] > currentPath[arg])
                    this[arg] = currentPath[arg]

            } else {
                this[arg] -= this.animation.speed

                if (this[arg] < currentPath[arg])
                    this[arg] = currentPath[arg]
            }
        }
    }


    // Draw the entity as a rectangle
    public draw(color: string, ctx: CanvasRenderingContext2D, onlyBorders?: boolean): void {
        if (this?.animation?.shouldMove && this.animation.paths.length > 1) {
            const { moveLevel, paths } = this.animation
            const currentPath = paths[moveLevel]

            this.animationHandler('x', currentPath)
            this.animationHandler('y', currentPath)

            if (this.x === currentPath.x && this.y === currentPath.y) {
                this.animation.moveLevel = paths[moveLevel + 1] ? moveLevel + 1 : 0
            }
        }

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


    // Toggle the animation
    public toggleAnimation(val: boolean): void {
        if (!this.animation)
            return

        this.animation.shouldMove = val
    }
}


export default Entity