import Entity from "./Entity.js"
import { ActionDefaults, Bullet, Effects, EntityStats, FlameWeapon, Maybe } from "../../interfaces/EntityTypes.js"
import { CanvasStats, CollisionValues, KeysInput } from "../../interfaces/GameTypes.js"
import { Bindings, PlayerEq, PlayerStats } from "../../interfaces/PlayerTypes.js"
import Item from "./Item.js"
import Action from "./Action.js"



class Player extends Action
{ 
    private keys:            KeysInput
    private blockedKeys:     Set<string>
    private bindings:        Bindings
    private flat_bindings:   string[]
    private movementStatus:  boolean
    private activeEffects:   string[]  
    private activeItems:     Item[] 

    private speedx:          number
    private jumpPower:       number

    private INIT_FINISH_VEL: number
    private COLL_PADDING:    number

    private isJumping:       boolean
    private isFalling:       boolean

    private friction:        number
    private initVelocity:    number
    private finishVelocity:  number

    private curr_items:      PlayerEq
    private start_items:     PlayerEq


    public constructor(x: number, y: number, w: number, h: number, speed: number, jumpPower: number, act_defaults: ActionDefaults)
    {
        super(x, y, w, h, {image: "/data/player/player.svg", act_defaults})

        this.INIT_FINISH_VEL = jumpPower / 10
        this.COLL_PADDING    = .5

        this.isJumping = false
        this.isFalling = false

        this.collisions = []

        this.initVelocity   = jumpPower 
        this.finishVelocity = this.INIT_FINISH_VEL
        this.friction       = .925

        this.curr_items  = new Array(6).fill(null)
        this.start_items = [...this.items]

        this.blockedKeys    = new Set<string>()
        this.movementStatus = true
        this.activeEffects  = []
        this.activeItems    = []

        this.bindings = {
            jump:  { keys: ['w', ' ', 'ArrowUp'], fn: ()=>{ (!this.isJumping && !this.isFalling) && this.jump() } },
            left:  { keys: ['a', 'ArrowLeft'],    fn: ()=>{ this.x -= this.speedx; this.last_dir = 'left' } },
            right: { keys: ['d', 'ArrowRight'],   fn: ()=>{ this.x += this.speedx; this.last_dir = 'right' } },
        }
        this.flat_bindings = Object.values(this.bindings).map(x => x.keys).flat()

        this.speedx    = speed
        this.jumpPower = jumpPower

        this.keys = {
            pressed: false,
            pressedKeys: []
        }
    }


    private handleJumping(jump?: boolean): void 
    {
        if (jump) this.isJumping = true

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


    public delete_entity(arr: Entity[], del_id: string): any[]
    {
        if (this.collisions.includes(del_id))
            this.collisions.splice(this.collisions.findIndex(e => e === del_id), 1)

        return arr.filter(x => x.getStats().id !== del_id)
    }


    public isCanvasCollided(canvas: CanvasStats): boolean 
    {
        if (!this.y || !this.x || (this.y + this.h) >= canvas.h || this.x + this.w === canvas.w)
            return true

        return false
    }


    public handleCanvasCollision(v: CollisionValues[], c: CanvasStats): void 
    {
        if (v.includes('top'))
        {
            this.isFalling = true
            this.isJumping = false
            this.y         = this.COLL_PADDING

            this.blockAction('jump')
        }

        if (v.includes('right'))
        {
            this.x = c.w - this.w
            this.blockAction('right')
        }

        if (v.includes('bottom'))
        {
            this.y = c.h - this.h
            this.blockedKeys.add('s')
        }

        if (v.includes('left'))
        {
            this.x = 0
            this.blockAction('left')
        }
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
            (e.anim && e.anim.paths[e.anim.moveLevel][1] < e.anim.paths[0][1])
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
            if (!this.isJumping && !this.isFalling && e.anim.paths[e.anim.moveLevel][1] < e.anim.paths[0][1])
                this.y = e.y - this.h

            if (e.anim.paths[e.anim.moveLevel][0] < e.anim.paths[e.anim.moveLevel-1]?.[0])
                this.x -= e.anim.speed
    
            if (e.anim.paths[e.anim.moveLevel]?.[0] > e.anim.paths[e.anim.moveLevel+1]?.[0])
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


    public resetJumpState(): void 
    {
        this.isJumping      = false
        this.isFalling      = false
        this.initVelocity   = this.jumpPower
        this.finishVelocity = this.jumpPower / 10
    }


    public getMovementStatus(): boolean
    {
        return this.movementStatus
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


    public setItem(index: number, item: Item): void
    {
        this.curr_items[index] = item
    }


    public clearItem(index: number): void
    {
        this.curr_items[index] = null
    }


    public loadEquipment(): void
    {
        this.curr_items = [...this.start_items]
    }


    public saveEquipment(): void
    {
        this.start_items = [...this.curr_items]
    }


    public addActiveEffect(effects: string[], item?: Item): void
    {
        this.activeEffects.push(...effects)
        item && this.activeItems.push(item)
    }


    public override drawShot(CTX: CanvasRenderingContext2D, b: Bullet)
    {
        const {x, y, w, h} = b.obj.getStats()

        if (b.explosionObj)
        {
            const {sizeStep, timeout} = b.explosionObj

            b.obj.setSize(w + sizeStep, h + sizeStep)
            b.obj.setPosition(x - sizeStep/2, y - sizeStep/2)

            if (!timeout)
                b.explosionObj.timeout = setTimeout(() => this.removeBullet(b.obj, true), 200)
        }
        else if (b.type === 'flamestream')
        {
            const gun:   FlameWeapon = this.weapon!.stats as FlameWeapon,
                  new_w: number      = w - gun.flamestep

            let leftshrink: number = 0                  

            if (!this.checkBinding('player_shoot') || !this.weapon?.stats.mag_ammo)
            {
                leftshrink = gun.flamestep

                b.obj.setSize(new_w)

                if (new_w <= gun.flamestep)
                {
                    this.removeBullet(b.obj)
                    this.gameobj?.stop_audio('/data/weapons/sounds/fire.wav')
                }
            }

            if (b.dir === -1)
                b.obj.setPosition(this.x - new_w - gun.flamestep - 2 + leftshrink , this.y)
            else
                b.obj.setPosition(this.x + this.w + 2, this.y)
        }
        else
        {
            // b.ang!+=.05
            // const xr = this.x + this.w / 2
            // const xy = this.y + this.h / 2

            // const x1 = xr + b.rad! * Math.cos(b.ang!) - 20/2; // X position based on the angle
            // const y1 = xy + b.rad! * Math.sin(b.ang!) - 10/2;
            // b.obj.setPosition(x1,y1)
            b.obj.setPosition(
                x + (b.dir * b.dirX) * this.weapon!.stats.bullet_speed, 
                y + b.dirY * this.weapon!.stats.bullet_speed
            )
        }

        b.obj.draw(CTX)
    }


    public getActiveItem(effect: string): Maybe<Item>
    {
        return this.activeItems.filter(x => x.getStats().name === effect)?.[0]
    }


    public isEffectActive(effect: Effects, with_item?: boolean): boolean
    {
        return this.activeEffects.includes(effect) 
               && (with_item ? this.activeItems.some(x => x.getStats().name === effect) : true)
    }


    public removeActiveEffect(name: string, from_items?: boolean): void
    {
        this.activeEffects = this.activeEffects.filter(x => x !== name)

        if (from_items)
            this.activeItems = this.activeItems.filter(x => x.getStats().name !== name)
    }


    public getActiveEffects(): string[]
    {
        return this.activeEffects
    }


    public override getStats(): PlayerStats
    {
        return {
            ...super.getStats(),
            jump_power: this.jumpPower,
            speed: this.speedx
        }
    }


    public get items(): PlayerEq
    {
        return this.curr_items
    }
}



export default Player