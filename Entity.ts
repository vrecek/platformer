import { AnimationArg, AnimationObject, AnimationPath, EntityStats, Maybe, OptionalArgs } from "./interfaces/EntityTypes"


class Entity 
{
    protected id:        string
    protected name:      Maybe
    protected color:     Maybe
    protected image:     Maybe<HTMLImageElement>
    protected x:         number
    protected y:         number
    protected w:         number
    protected h:         number
    protected animation: Maybe<AnimationObject>


    public constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        this.id    = Math.random().toString().slice(2)
        this.name  = args?.name
        this.color = args?.color

        this.x = x
        this.y = y
        this.w = w
        this.h = h

        if (args?.image)
        {
            const i: HTMLImageElement = new Image();

            i.src = args.image
            i.onload = () => { this.image = i }
        }

        this.animation = args?.animPath ? {

            speed: args.animPath.speed,
            shouldMove: true,
            moveLevel: 1,
            paths: [
                { x, y },
                ...args.animPath.paths
            ]

        } : null
    }


    private animationHandler(arg: 'x' | 'y', currentPath: AnimationPath): void
    {
        if (!this.animation) return

        if (this[arg] !== currentPath[arg])
        {
            if (this[arg] < currentPath[arg]) 
            {
                this[arg] += this.animation.speed 

                if (this[arg] > currentPath[arg])
                    this[arg] = currentPath[arg]

            } 
            else 
            {
                this[arg] -= this.animation.speed

                if (this[arg] < currentPath[arg])
                    this[arg] = currentPath[arg]
            }
        }
    }


    public draw(ctx: CanvasRenderingContext2D, color?: string, onlyBorders?: boolean): void {
        if (this?.animation?.shouldMove && this.animation.paths.length > 1)
        {
            const {moveLevel, paths} = this.animation,
                  currentPath        = paths[moveLevel]

            this.animationHandler('x', currentPath)
            this.animationHandler('y', currentPath)

            if (this.x === currentPath.x && this.y === currentPath.y)
                this.animation.moveLevel = paths[moveLevel + 1] ? moveLevel + 1 : 0
        }

        if (this.image)
        {
            ctx.drawImage(this.image, this.x, this.y, this.w, this.h)
            return
        }

        const clr: string = color ?? this.color ?? "#000"

        ctx.beginPath()
        ctx.rect(this.x, this.y, this.w, this.h)

        if (onlyBorders) 
        {
            ctx.strokeStyle = clr
            ctx.stroke()
        } 
        else 
        {
            ctx.fillStyle = clr
            ctx.fill()
        }
    }

    
    public getStats(): EntityStats
    {
        return {
            id:   this.id,
            name: this.name,
            anim: this.animation,
            x:    this.x,
            y:    this.y,
            w:    this.w,
            h:    this.h
        }
    }


    public toggleAnimation(val: boolean): void
    {
        if (!this.animation) return
            
        this.animation.shouldMove = val
    }
}


export default Entity