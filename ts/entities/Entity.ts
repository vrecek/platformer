import { AnimationObject, PathObj, CollisionCb, EntityPos, EntityStats, Maybe, OptionalArgs, Path } from "../../interfaces/EntityTypes"


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
        this.color = args?.color ?? '#3a8cf3'

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
                [x, y],
                ...args.animPath.paths
            ]

        } : null
    }


    private animationHandler(arg: 'x' | 'y', currentPath: Path): void
    {
        if (!this.animation) return

        const val: number = arg === 'x' ? currentPath[0] : currentPath[1]

        if (this[arg] !== val)
        {
            if (this[arg] < val) 
            {
                this[arg] += this.animation.speed 

                if (this[arg] > val)
                    this[arg] = val
            } 
            else 
            {
                this[arg] -= this.animation.speed

                if (this[arg] < val)
                    this[arg] = val
            }
        }
    }


    public draw(ctx: CanvasRenderingContext2D, color?: string, asCircle?: boolean): void
    {
        if (this?.animation?.shouldMove && this.animation.paths.length > 1 && !this.animation_wait)
        {
            const {moveLevel, paths} = this.animation!,
                  currentPath        = paths[moveLevel]

            this.animationHandler('x', currentPath)
            this.animationHandler('y', currentPath)

            if (this.x === currentPath[0] && this.y === currentPath[1])
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

        ctx.beginPath()

        asCircle 
            ? ctx.arc(this.x, this.y, this.w, 0, Math.PI * 2)
            : ctx.rect(this.x, this.y, this.w, this.h)

        ctx.fillStyle = color ?? this.color ?? "#000"
        ctx.fill()
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


    public isAnimationEnabled(): boolean
    {
        return !!this.animation?.shouldMove
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


    public setSize(w?: number, h?: number): void
    {
        if (w) this.w = w
        if (h) this.h = h
    }


    public getPosition(): EntityPos
    {
        return {
            x: this.x,
            y: this.y
        }
    }

    
    public checkCollision<T extends Entity>(entities: T[], collidedFn?: CollisionCb<T>, uncollidedFn?: Maybe<CollisionCb<T>>): T | null
    {
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