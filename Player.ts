import Entity from "./Entity.js";
import { CollisionCb, EntityStats, Maybe } from "./interfaces/EntityTypes.js";
import { CanvasStats, KeysInput } from "./interfaces/GameTypes.js";
import { Bindings, PlayerPos, PlayerStats } from "./interfaces/PlayerTypes.js";
import Item from "./Item.js";



class Player extends Entity 
{ 
    private keys:            KeysInput
    private blockedKeys:     Set<string>
    private bindings:        Bindings
    private flat_bindings:   string[]
    private movementStatus:  boolean
    private activeEffects:   string[]   

    private speedx:          number
    private jumpPower:       number

    private INIT_FINISH_VEL: number
    private COLL_PADDING:    number

    private isJumping:       boolean
    private isFalling:       boolean

    private friction:        number
    private initVelocity:    number
    private finishVelocity:  number

    public items: (Item|null)[]


    public constructor(x: number, y: number, w: number, h: number, speed: number, jumpPower: number)
    {
        super(x, y, w, h, {image: "/data/player.svg"})

        this.INIT_FINISH_VEL = jumpPower / 10
        this.COLL_PADDING    = .5

        this.isJumping = false
        this.isFalling = false

        this.initVelocity   = jumpPower 
        this.finishVelocity = this.INIT_FINISH_VEL
        this.friction       = .925

        this.items = new Array(6).fill(null)

        this.blockedKeys    = new Set<string>()
        this.movementStatus = true
        this.activeEffects  = []

        this.bindings = {
            jump:  { keys: ['w', ' ', 'ArrowUp'], fn: ()=>{} },
            left:  { keys: ['a', 'ArrowLeft'],    fn: ()=>{ this.x -= this.speedx } },
            right: { keys: ['d', 'ArrowRight'],   fn: ()=>{ this.x += this.speedx } },
        }
        this.flat_bindings = Object.values(this.bindings).map(x => x.keys).flat()

        this.speedx    = speed
        this.jumpPower = jumpPower

        this.keys = {
            pressed: false,
            pressedKeys: []
        }
    }


    private handleJumping(force?: boolean): void 
    {
        if (force || (this.checkBinding('jump') && !this.isJumping && !this.isFalling))
            this.isJumping = true

        if (!this.isJumping || !this.movementStatus || this.isFalling) 
            return


        if (this.initVelocity <= this.INIT_FINISH_VEL) 
        {
            this.isJumping = false
            this.isFalling = true
        }

        if (this.isJumping) 
        {
            this.initVelocity *= this.friction
            this.y            -= this.initVelocity
        }
    }

    private resetJumpState(): void 
    {
        this.isJumping      = false
        this.isFalling      = false
        this.initVelocity   = this.jumpPower
        this.finishVelocity = this.INIT_FINISH_VEL
    }

    private checkMovementCondition(): boolean 
    {
        if (
            !this.keys.pressed ||
            !this.movementStatus ||
            (this.blockedKeys.size && [...this.blockedKeys].some(x => this.keys.pressedKeys.includes(x)))
        )
            return true


        return false
    }

    private checkBinding(action: string): boolean 
    {
        return this.keys.pressedKeys.some(x => this.bindings[action].keys.includes(x))
    }

    private blockAction(action: string): void
    {
        for (const x of this.bindings[action].keys)
            this.blockedKeys.add(x)
    }


    public handleGravity(entColl: Maybe<Entity>, canvasStats: CanvasStats): void 
    {
        if (this.isCanvasCollided(canvasStats) && this.y + this.h === canvasStats.h) 
        {
            this.resetJumpState()
            return
        }

        const s: Maybe<EntityStats> = entColl?.getStats()

        if (
            !(!this.movementStatus || !this.isFalling && (entColl || this.isJumping)) ||
            (s?.anim && ((this.x >= s.x+s.w-s.anim.speed) || (this.x+this.w <= s.x+s.anim.speed)) )
        ) 
        {
            this.isFalling = true

            this.finishVelocity *= ((1 % this.friction) + 1)
            this.y              += this.finishVelocity
        }
    }


    public checkCollision(entities: Entity[], collidedFn?: CollisionCb, uncollidedFn?: Maybe<CollisionCb>): Entity | null {
        let collidedEntity: Entity | null = null

        for (const ent of entities) 
        {
            const { x, y, w, h } = ent.getStats()

            if ( ((this.x + this.w >= x) && (this.y + this.h >= y)) && ((this.x <= x + w) && (this.y <= y + h)) )
            {
                collidedFn && collidedFn(ent)

                collidedEntity = ent
            }
            else 
                uncollidedFn && uncollidedFn(ent)
        }

        return collidedEntity
    }


    public isCanvasCollided(canvas: CanvasStats): boolean 
    {
        if (!this.y || !this.x || (this.y + this.h) >= canvas.h || this.x + this.w === canvas.w)
            return true

        return false
    }


    public handleCanvasCollision(canvas: CanvasStats): void 
    {
        const plrYHeight: number = this.y + this.h


        if (this.y <= 0) {
            this.isFalling = true
            this.isJumping = false

            this.y = this.COLL_PADDING
            this.blockAction('jump')
        }
        
        if (this.x <= 0)
        {
            this.x = 0
            this.blockAction('left')
        }

        if (plrYHeight >= canvas.h) {
            this.y = canvas.h - this.h

            this.blockedKeys.add('s')
        }

        if (this.x + this.w >= canvas.w)
            this.blockAction('right')
    }


    public stopCollisionMovement(ent: Entity): void 
    {
        const e:          EntityStats = ent.getStats(),
              plrYHeight: number      = this.y + this.h,
              anim_speed: number      = e.anim?.speed ?? 0

        let from_bottom:  boolean = false,
            from_top:     boolean = false
              

        // If the player is falling down to an object
        if (
            this.isFalling && plrYHeight >= e.y && 
            this.x < e.x + e.w-2 && this.x + this.w-2 > e.x ||
            (e.anim && e.anim.paths[e.anim.moveLevel].y < e.anim.paths[0].y)
        ) {
            this.resetJumpState()

            if (!e.anim)
                this.y = e.y - this.h

            from_top = true
        }


        // If the player jump-touches an object from the ground
        if (e.y + e.h < this.y + this.jumpPower && !this.isFalling) {
            this.isJumping = false
            this.isFalling = true
            this.y = e.y + e.h + 2
            
            from_bottom = true
        }

        if (e.anim && !from_bottom)
        {
            if (!this.isJumping && !this.isFalling && e.anim.paths[e.anim.moveLevel].y < e.anim.paths[0].y)
                this.y = e.y - this.h

            if (e.anim.paths[e.anim.moveLevel].x < e.anim.paths[e.anim.moveLevel-1]?.x)
                this.x -= e.anim.speed
    
            if (e.anim.paths[e.anim.moveLevel].x > e.anim.paths[e.anim.moveLevel+1]?.x)
                this.x += e.anim.speed
        }


        if (e.y + e.h === this.y) 
            this.blockAction('jump')

        else if (e.x + e.w <= this.x + this.speedx && this.y + this.h > e.y + anim_speed)
        {
            if (!from_bottom && !from_top) 
                this.x = e.x + e.w

            if (e.anim) this.x++

            this.blockAction('left')
        }

        else if (e.y === plrYHeight) 
            this.blockedKeys.add('s')

        else if (this.x + this.w >= e.x && this.y + this.h > e.y + anim_speed)
        {
            if (!from_bottom && !from_top) 
                this.x = e.x - this.w

            this.blockAction('right')
        }
    }


    public handleStandardMoveKeys(): void 
    {
        if (this.checkMovementCondition())
            return


        if (this.keys.pressedKeys.includes('w'))
            this.y -= this.speedx

        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speedx

        if (this.keys.pressedKeys.includes('s'))
            this.y += this.speedx

        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speedx
    }


    public handleAdvancedMoveKeys(): void 
    {
        this.handleJumping()

        if (this.checkMovementCondition())
            return

        for (const x in this.bindings)
        {
            if (this.checkBinding(x))
                this.bindings[x].fn()
        }
    }


    public isTouchingGround(): boolean
    {
        return !this.isJumping && !this.isFalling
    }


    public addKey(key: string): void
    {
        if (!this.flat_bindings.includes(key) || this.keys.pressedKeys.includes(key))
            return

        this.keys.pressed = true
        this.keys.pressedKeys.push(key)
    }


    public removeKey(key: string): void
    {
        this.keys.pressedKeys.splice(this.keys.pressedKeys.indexOf(key), 1)

        if (!this.keys.pressedKeys.length)
            this.keys.pressed = false
    }


    public jump(): void
    {
        this.initVelocity = this.jumpPower
        this.handleJumping(true)
    }


    public initPressKeyEvents(): void 
    {
        window.addEventListener('keydown', ({key}) => this.addKey(key))
        window.addEventListener('keyup', ({key}) => this.removeKey(key))
    }


    public changePlayerMovementStatus(enabled: boolean): void 
    {
        this.movementStatus = enabled
    }


    public resetBlockedKeys(): void 
    {
        this.blockedKeys.clear()
    }


    public getMovementStatus(): boolean
    {
        return this.movementStatus
    }


    public getPlayerPosition(): PlayerPos
    {
        return {
            x: this.x,
            y: this.y
        }
    }


    public setPlayerPos(newX: number, newY: number): void 
    {
        this.x = newX
        this.y = newY
    }


    public addBinding(action: string, keys: string[], fn: ()=>void): void
    {
        this.bindings[action] = { keys, fn }
        this.flat_bindings    = Object.values(this.bindings).map(x => x.keys).flat()
    }


    public setPlayerJumpPower(power: number): void
    {
        this.jumpPower = power
    }

    
    public setPlayerSpeed(speed: number): void
    {
        this.speedx = speed
    }


    public addActiveEffect(...effects: string[]): void
    {
        this.activeEffects.push(...effects)
    }

    
    public setPlayerImage(img: string): void
    {
        const i: HTMLImageElement = new Image();

        i.src = img
        i.onload = () => { this.image = i }
    }


    public getActiveEffects(): string[]
    {
        return this.activeEffects
    }


    public isEffectActive(effect: string): boolean
    {
        return this.activeEffects.includes(effect)
    }


    public removeActiveEffect(name: string): void
    {
        const i: number = this.activeEffects.findIndex(x => x === name)

        if (i !== -1)
            this.activeEffects.splice(i, 1)
    }


    public override getStats(): PlayerStats
    {
        return {
            ...super.getStats(),
            jump_power: this.jumpPower,
            speed: this.speedx
        }
    }
}


export default Player