import Entity from "./Entity.js"
import { Bullet, DamageObject, Effects, EntityStats, FlameWeapon, Maybe, PlayerArgs } from "../../interfaces/EntityTypes.js"
import { CanvasStats, CollisionValues, KeysInput, VoidFn } from "../../interfaces/GameTypes.js"
import { Bindings, PlayerEq, PlayerSavedStats, PlayerStats } from "../../interfaces/PlayerTypes.js"
import Item from "./Item.js"
import Action from "./Action.js"
import Game from "../Game.js"



class Player extends Action
{ 
    private blockedKeys:     Set<string>
    private movementStatus:  boolean
    private activeEffects:   string[]  
    private activeItems:     Item[] 

    private speedx:          number
    private jumpPower:       number

    private INIT_FINISH_VEL: number
    private COLL_PADDING:    number

    private fired_shots:     number
    private killed_enemies:  number

    private isJumping:       boolean
    private isFalling:       boolean

    private friction:        number
    private initVelocity:    number
    private finishVelocity:  number

    private curr_items:      PlayerEq
    private start_items:     PlayerEq


    public constructor(x: number, y: number, w: number, h: number, speed: number, jumpPower: number, args: PlayerArgs)
    {
        super(x, y, w, h, {image: "/data/player/player.svg", ...args, bindings: {
            jump:  { keys: ['w', ' ', 'ArrowUp'], fn: ()=>{ (!this.isJumping && !this.isFalling) && this.jump() } },
            left:  { keys: ['a', 'ArrowLeft'],    fn: ()=>{ this.x -= this.speedx; this.last_dir = 'left' } },
            right: { keys: ['d', 'ArrowRight'],   fn: ()=>{ this.x += this.speedx; this.last_dir = 'right' } },
        }})

        const saved: Maybe<PlayerSavedStats> = Game.storage_load('player_stats')

        this.INIT_FINISH_VEL = jumpPower / 10
        this.COLL_PADDING    = .5

        this.isJumping = false
        this.isFalling = false

        this.collisions = []

        if (!saved)
        {
            Game.storage_save('player_stats', {
                fired_shots: 0,
                killed_enemies: 0
            })
        }

        this.fired_shots    = saved?.fired_shots ?? 0
        this.killed_enemies = saved?.killed_enemies ?? 0

        this.initVelocity   = jumpPower 
        this.finishVelocity = this.INIT_FINISH_VEL
        this.friction       = .925

        this.curr_items  = new Array(6).fill(null)
        this.start_items = [...this.curr_items]

        this.blockedKeys    = new Set<string>()
        this.movementStatus = true
        this.activeEffects  = []
        this.activeItems    = []

        this.speedx    = speed
        this.jumpPower = jumpPower
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
            !this.isKeyPressed() ||
            !this.movementStatus ||
            (this.blockedKeys.size && [...this.blockedKeys].some(x => this.isKeyPressed(x)))
        )
            return true


        return false
    }

    private blockAction(action: string): void
    {
        for (const x of this.getBindings()[action].keys)
            this.blockedKeys.add(x)
    }

    private change_stats(key: keyof PlayerSavedStats, val: number | 'increment'): void
    {
        const curr: PlayerSavedStats = Game.storage_load('player_stats')

        if (val === 'increment') 
            curr[key]++
        else 
            curr[key] = val

        Game.storage_save('player_stats', curr)
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


    public isTouchingGround(): boolean
    {
        return !this.isJumping && !this.isFalling
    }


    public jump(): void
    {
        this.initVelocity = this.jumpPower
        this.handleJumping(true)
    }


    public changePlayerMovementStatus(enabled: boolean): void 
    {
        this.movementStatus = enabled
    }


    public resetJumpState(): void 
    {
        this.isJumping      = false
        this.isFalling      = false
        this.initVelocity   = this.jumpPower
        this.finishVelocity = this.jumpPower / 10
    }


    // ---------------------------------------------------
    // ----------------- KEY HANDLERS --------------------
    // ---------------------------------------------------

    public resetBlockedKeys(): void 
    {
        this.blockedKeys.clear()
    }

    public initPressKeyEvents(): void 
    {
        window.addEventListener('keydown', ({key}) => this.addKey(key))
        window.addEventListener('keyup',   ({key}) => this.removeKey(key))
    }

    public handleStandardMoveKeys(): void 
    {
        if (this.checkMovementCondition())
            return


        if (this.isKeyPressed('w'))
            this.y -= this.speedx

        if (this.isKeyPressed('a'))
            this.x -= this.speedx

        if (this.isKeyPressed('s'))
            this.y += this.speedx

        if (this.isKeyPressed('d'))
            this.x += this.speedx
    }

    public handleAdvancedMoveKeys(): void 
    {
        this.handleJumping()

        if (this.checkMovementCondition())
            return

        for (const x in this.getBindings())
        {
            if (this.checkBinding(x))
                this.getBindings()[x].fn()
        }
    }

    // ---------------------------------------------------
    // ------------------- OVERRIDES ---------------------
    // ---------------------------------------------------

    public override deal_damage(target: Action, bullet?: Bullet): DamageObject {
        const damage_result: DamageObject = super.deal_damage(target, bullet)

        if (damage_result.killed)
        {
            this.killed_enemies++
            this.change_stats('killed_enemies', 'increment')
        }

        return damage_result
    }

    public override shoot(reloadCB?: Maybe<VoidFn>): boolean
    {
        const shot: boolean = super.shoot(reloadCB)

        if (this.weapon?.type !== 'flamethrower' && shot)
        {
            this.fired_shots++
            this.change_stats('fired_shots', 'increment')
        }
        
        return shot
    }

    // ---------------------------------------------------
    // ------------------- EQUIPMENT ---------------------
    // ---------------------------------------------------

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

    // ---------------------------------------------------
    // ------------------- EFFECTS -----------------------
    // ---------------------------------------------------

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

    public addActiveEffect(effects: string[], item?: Item): void
    {
        this.activeEffects.push(...effects)

        item && this.activeItems.push(item)
    }

    // ---------------------------------------------------
    // ------------------- GETTERS -----------------------
    // ---------------------------------------------------

    public getFiredShots(): number
    {
        return this.fired_shots
    }

    public getKilledEnemies(): number
    {
        return this.killed_enemies
    }

    public getMovementStatus(): boolean
    {
        return this.movementStatus
    }

    public getActiveItem(effect: string): Maybe<Item>
    {
        return this.activeItems.filter(x => x.getStats().name === effect)?.[0]
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

    // ---------------------------------------------------
    // ------------------- SETTERS -----------------------
    // ---------------------------------------------------

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
}



export default Player