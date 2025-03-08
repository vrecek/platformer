import { AnimationObject, AnimationPath, CollisionCb, EntityPos, EntityStats, Maybe, OptionalArgs } from "../../interfaces/EntityTypes"


class Entity 
{
    private image:          Maybe<HTMLImageElement>
    private animation:      Maybe<AnimationObject>
    private animation_wait: boolean

    protected id:         string
    protected name:       Maybe
    protected color:      Maybe
    protected image_src:  Maybe
    protected x:          number
    protected y:          number
    protected w:          number
    protected h:          number
    protected collisions: string[]
    

    public constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        this.id    = Math.random().toString().slice(2)
        this.name  = args?.name
        this.color = args?.color

        this.collisions = []

        this.x = x
        this.y = y
        this.w = w
        this.h = h

        if (args?.image)
            this.setImage(args.image)

        this.animation_wait = false
        this.animation = args?.animPath ? {

            speed: args.animPath.speed,
            interval_wait: args.animPath.interval_wait,
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


    public draw(ctx: CanvasRenderingContext2D, color?: string, onlyBorders?: boolean): void
    {
        if (this?.animation?.shouldMove && this.animation.paths.length > 1 && !this.animation_wait)
        {
            const {moveLevel, paths} = this.animation!,
                  currentPath        = paths[moveLevel]

            this.animationHandler('x', currentPath)
            this.animationHandler('y', currentPath)

            if (this.x === currentPath.x && this.y === currentPath.y)
            {
                this.animation_wait = true
                
                setTimeout(() => {
                    this.animation!.moveLevel = paths[moveLevel + 1] ? moveLevel + 1 : 0
                    this.animation_wait = false

                }, this.animation.interval_wait ?? 0);
            }
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
            img:  this.image_src,
            anim: this.animation,
            x:    this.x,
            y:    this.y,
            w:    this.w,
            h:    this.h
        }
    }


    public toggleAnimation(should_move: boolean): void
    {
        if (!this.animation) return
            
        this.animation.shouldMove = should_move
    }


    public setImage(img_path: string): void
    {
        const i: HTMLImageElement = new Image();
        
        i.src = img_path
        i.onload = () => {
            this.image = i
            this.image_src = img_path
        }
    }


    public setPosition(x: number, y: number): void
    {
        this.x = x
        this.y = y
    }


    public getPosition(): EntityPos
    {
        return {
            x: this.x,
            y: this.y
        }
    }

    
    public checkCollision<T extends Entity>(entities: T[], collidedFn?: CollisionCb<T>, uncollidedFn?: Maybe<CollisionCb<T>>): T | null {
        let collidedEntity: T | null = null

        for (const ent of entities) 
        {
            const { x, y, w, h, id } = ent.getStats()

            if ( ((this.x + this.w >= x) && (this.y + this.h >= y)) && ((this.x <= x + w) && (this.y <= y + h)) )
            {
                collidedEntity = ent

                if (this.collisions.every(x => x !== id))
                    this.collisions.push(id)

                collidedFn && collidedFn(ent)
            }
            else if (this.collisions.includes(id)) 
            {
                this.collisions.splice(this.collisions.findIndex(e => e === id), 1)

                uncollidedFn && uncollidedFn(ent)
            }
        }

        return collidedEntity
    }
}


export default Entity