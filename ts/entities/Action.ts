import { ActionArgs, Bullet, BulletDirection, DamageObject, EntityStats, FlameWeapon, Maybe, ShootDirection, ShotgunWeapon, Weapon, WeaponStat } from "../../interfaces/EntityTypes.js";
import { KeysInput, VoidFn } from "../../interfaces/GameTypes.js";
import { ActionStats, Bindings } from "../../interfaces/PlayerTypes.js";
import Game from "../Game.js";
import Entity from "./Entity.js";


abstract class Action extends Entity
{
    private has_shot:        boolean
    private bullet_lifetime: number
    private shots:           Bullet[]
    private reload_timer:    number | undefined
    private godmode:         boolean
    private flat_bindings:   string[]
    private keys:            KeysInput
    private bindings:        Bindings

    protected weapon:       Maybe<Weapon>
    protected weapon_def:   Maybe<Weapon>
    protected weapon_saved: Maybe<Weapon>

    protected gameobj: Maybe<Game>

    protected health:     number
    protected max_health: number
    protected armor:      number
    protected max_armor:  number
    protected armor_prot: number

    protected last_dir:      ShootDirection
    


    private getBulletImage(type: string, width: number, absfile?: string): [number, string, BulletDirection]
    {
        let x:   number          = this.x + this.w + 2, 
            img: string          = absfile ?? `/data/${type}_right.svg`,
            dir: BulletDirection = 1


        if (this.last_dir === 'left')
        {
            dir = -1
            img = absfile ?? `/data/${type}_left.svg`
            x   = this.x - width
        }

        return [x, img, dir]
    }

    private singleBullet(x: number, img: string, dir: BulletDirection): void
    {
        const dg  = this.weapon!.stats.angle,
              ang = Game.degToRad(Math.random() * (dg*2) - dg)

        const obj: Entity = new Entity(x, this.y, 20, 10, {image: img})

        this.shots.push({obj, dir, dirX: Math.cos(ang), dirY: Math.sin(ang), type: 'regular'})
        
        Game.addTimer(() => this.removeBullet(obj), this.bullet_lifetime)
    }

    private shotgunBullet(x: number, img: string, dir: BulletDirection): void
    {
        const gun: ShotgunWeapon = this.weapon!.stats as ShotgunWeapon

        const angle_start: number = Game.degToRad(-gun.angle),
              angle_step:  number = (Game.degToRad(gun.angle) - angle_start) / (gun.bullet_nr - 1)


        for (let i = 0; i < gun.bullet_nr; i++)
        {   
            const angle = angle_start + i * angle_step,
                  obj   = new Entity(x, this.y, 20, 10, {image: img})


            this.shots.push({obj, dir, dirX: Math.cos(angle), dirY: Math.sin(angle), type: 'regular' })

            Game.addTimer(() => this.removeBullet(obj), this.bullet_lifetime)
        }
    }

    private rocketBullet(x: number, img: string, dir: BulletDirection): void
    {
        const obj: Entity = new Entity(x, this.y, 50, 20, {image: img})

        this.shots.push({obj, dir, dirX: 1, dirY: Math.sin(Game.degToRad(this.weapon!.stats.angle)), type: 'explosive'})
        
        Game.addTimer(() => this.removeBullet(obj), this.bullet_lifetime)
    }

    private flamethrowerBullet(x: number, img: string, dir: BulletDirection): void
    {
        const i: number = this.shots.findIndex(x => x.type === 'flamestream')
        
        if (i !== -1)
        {
            const gun = this.weapon!.stats as FlameWeapon,
                  {w} = this.shots[i].obj.getStats()

            if (w < gun.maxflame)
                this.shots[i].obj.setSize(w + gun.flamestep)

            return
        }

        const obj: Entity = new Entity(x, this.y, 40, 40, {image: img})

        this.shots.push({obj, dir, dirX: 1, dirY: 0, type: 'flamestream', flame_affected: []})
    }

    private weapon_copy(weapon: Maybe<Weapon>): Maybe<Weapon>
    {
        return weapon ? { ...weapon, stats: {...weapon.stats} } : null
    }


    protected checkBinding(action: string): boolean 
    {
        return this.keys.activeKeys.some(x => this.bindings[action]?.keys.includes(x))
    }

    protected isKeyPressed(key?: string): boolean
    {
        return key ? this.keys.activeKeys.includes(key) : !!this.keys.activeKeys.length
    }

    protected getBindings(): Bindings
    {
        return this.bindings
    }

    protected hasShotBullet(type: string): boolean
    {
        return this.shots.findIndex(x => x.type === type) !== -1
    }



    protected constructor(x: number, y: number, w: number, h: number, args?: Maybe<ActionArgs>)
    {
        super(x, y, w, h, args)

        this.gameobj    = args?.game

        this.has_shot   = false
        this.shots      = []
        this.last_dir   = args?.direction ?? 'left'

        this.health     = args?.health ?? 100
        this.max_health = this.health
        this.armor      = args?.armor ?? 0
        this.max_armor  = args?.armor_max ?? this.armor
        this.armor_prot = args?.armor_prot ?? 0
        this.godmode    = args?.godmode ?? false

        this.bullet_lifetime = 2000
        this.weapon          = this.weapon_copy(args?.weapon)
        this.weapon_def      = this.weapon_copy(args?.weapon)
        this.weapon_saved    = this.weapon_copy(args?.weapon)

        this.keys = {
            activeKeys: []
        }

        this.bindings      = args?.bindings ?? {}
        this.flat_bindings = Object.values(this.bindings).map(x => x.keys).flat()
    }



    public addBinding(action: string, keys: string[], fn: VoidFn): void
    {
        this.bindings[action] = { keys, fn }
        this.flat_bindings    = Object.values(this.bindings).map(x => x.keys).flat()
    }


    public addKey(key: string): void
    {
        if (!this.flat_bindings.includes(key) || this.keys.activeKeys.includes(key))
            return

        this.keys.activeKeys.push(key)
    }


    public removeKey(key: string): void
    {
        const i: number = this.keys.activeKeys.indexOf(key)

        i !== -1 && this.keys.activeKeys.splice(i, 1)
    }


    public shoot(reloadCB?: Maybe<VoidFn>): boolean
    {
        if (this.has_shot || !this.weapon || this.weapon.is_reloading || !this.weapon.stats.mag_ammo) 
            return false


        switch (this.weapon.type)
        {
            case 'pistol':
            case 'smg':
            case 'machinegun':
                this.singleBullet(...this.getBulletImage('bullet', 20))
                break

            case 'rocketlauncher':
                this.rocketBullet(...this.getBulletImage('rocket', 50))
                break

            case 'flamethrower':
                this.flamethrowerBullet(...this.getBulletImage('fire', 40, '/data/fire.png'))
                break

            case 'shotgun':
                this.shotgunBullet(...this.getBulletImage('bullet', 20))
                break
            
            default: return false
        }

        if (!this.weapon.inf_ammo && !--this.weapon.stats.mag_ammo && this.weapon.stats.total_ammo)
            this.reload(reloadCB)


        this.has_shot = true
        Game.addTimer(() => this.has_shot = false, this.weapon.stats.shoot_cd)


        if (!this.gameobj?.is_audio_playing('/data/weapons/sounds/fire.wav'))
            this.gameobj?.audio?.(this.weapon.wav)

        return true
    }


    public drawShot(CTX: CanvasRenderingContext2D, b: Bullet): void
    {
        const {x, y, w, h} = b.obj.getStats()

        if (b.explosionObj)
        {
            const {sizeStep, timeout} = b.explosionObj

            b.obj.setSize(w + sizeStep, h + sizeStep)
            b.obj.setPosition(x - sizeStep/2, y - sizeStep/2)

            if (!timeout)
                b.explosionObj.timeout = Game.addTimer(() => this.removeBullet(b.obj, true), 200)
        }
        else if (b.type === 'flamestream')
        {
            const gun:   FlameWeapon = this.weapon!.stats as FlameWeapon,
                  new_w: number      = w - gun.flamestep

            let leftshrink: number = 0                  

            if (!this.checkBinding('entity_shoot') || !this.weapon?.stats.mag_ammo)
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
            b.obj.setPosition(
                x + (b.dir * b.dirX) * this.weapon!.stats.bullet_speed, 
                y + b.dirY * this.weapon!.stats.bullet_speed
            )
        }

        b.obj.draw(CTX)
    }


    public getShots(): Bullet[]
    {
        return this.shots
    }


    public reload(reloadCB?: Maybe<VoidFn>): void
    {
        if (
            this.weapon?.is_reloading || !this.weapon || !this.weapon.stats.total_ammo ||
            this.weapon.stats.mag_ammo === this.weapon_def?.stats.mag_ammo
        ) 
            return


        this.weapon.is_reloading = true
        this.gameobj?.audio?.('/data/weapons/sounds/reload.wav')

        this.reload_timer = Game.addTimer(() => {
            if (!this.weapon || !this.weapon.is_reloading) return

            let missing: number = this.weapon_def!.stats.mag_ammo - this.weapon.stats.mag_ammo,
                new_mag: number = this.weapon_def!.stats.mag_ammo

            if (this.weapon.stats.total_ammo - missing < 0)
            {
                new_mag = this.weapon.stats.mag_ammo + this.weapon.stats.total_ammo
                missing = this.weapon.stats.total_ammo
            }
            
            this.weapon.stats.total_ammo -= missing
            this.weapon.stats.mag_ammo    = new_mag
            this.weapon.is_reloading      = false

            Game.removeFunction(id)
            Game.removeDynamicDate('reload')

            reloadCB?.()

        }, this.weapon.stats.reload_time)


        const id:  string = Game.generateID(),
              ctx: CanvasRenderingContext2D = this.gameobj!.getCtx()

        Game.addFunction(id, () => {
            ctx.font = "12px Verdana, Geneva, Tahoma, sans-serif"

            const delta: number = Date.now() - Game.getDynamicDate('reload'),
                  textx: number = this.x + (this.w - ctx.measureText('RELOADING').width) / 2,
                  barw:  number = ( (this.weapon!.stats.reload_time - delta) / this.weapon!.stats.reload_time ) * 80

            ctx.fillStyle = "white"
            ctx.fillText('RELOADING', textx, this.y - 20)

            ctx.beginPath()
            ctx.fillStyle = '#eee'
            ctx.rect(this.x + (this.w - barw) / 2, this.y - 15, barw, 10)
            ctx.fill()
        })
    }


    public addAmmo(count: number): void
    {
        if (!this.weapon) return

        this.weapon.stats.total_ammo = Math.min(this.weapon.stats.total_ammo + count, this.weapon.stats.max_ammo);
    }


    public displayHealth(ctx: CanvasRenderingContext2D): void
    {
        const h:       number = 10,
              w_def:   number = 80,
              y:       number = this.y - h - 5,
              center:  number = this.x + (this.w - w_def) / 2,
              healthv: number = (w_def * this.health) / this.max_health,
              healthx: number = this.x + (this.w - healthv) / 2


        ctx.beginPath()
        ctx.fillStyle = '#555e77'
        ctx.rect(center, y, w_def, h)
        ctx.fill()

        ctx.beginPath()
        ctx.fillStyle = '#13D646'
        ctx.rect(healthx, y, healthv, h)
        ctx.fill()
    }


    public displayDamage(ctx: CanvasRenderingContext2D, dmg: number): void
    {
        const maxw: number = this.x + this.w,
              x:    number = ~(Math.random() * (maxw - this.x + 1)) + maxw,
              id:   string = Game.generateID()

        let y: number = this.y - 25


        ctx.font = "16px Verdana, Geneva, Tahoma, sans-serif"
        ctx.fillStyle = 'white'
        ctx.fillText(`${dmg}`, x, y)

        Game.addFunction(id, () => {
            Game.addTimer(() => Game.removeFunction(id), 1000)

            ctx.font = "16px Verdana, Geneva, Tahoma, sans-serif"
            ctx.fillStyle = 'white'
            ctx.fillText(`${dmg}`, x, y--)
        })
    }


    public deal_damage(target: Action, bullet?: Bullet): DamageObject
    {
        const returnObj: DamageObject = { dmgdealt: 0, killed: false}

        if (target.godmode)
            return returnObj
        
        if (bullet?.type === 'explosion' && bullet.explosionObj)
        {
            if (bullet.explosionObj.affected.includes(target.id))
                return returnObj
            
            bullet.explosionObj.affected.push(target.id)
        }
        else if (bullet?.type === 'flamestream' && bullet.flame_affected && this.weapon?.type === 'flamethrower')
        {
            if (bullet.flame_affected.includes(target.id))
                return returnObj

            bullet.flame_affected.push(target.id)

            Game.addTimer(() => {
                if (!bullet.flame_affected) return

                const i: number = bullet.flame_affected.findIndex(x => x === target.id)

                if (i !== -1)
                    bullet.flame_affected.splice(i, 1)
                
            }, (this.weapon.stats as FlameWeapon).dmg_cooldown);
        }


        const prot_percent: number = target.armor_prot * 0.01,
              weapon_dmg:   number = Math.floor(this.weapon!.stats.bullet_dmg * prot_percent),
              armor_deal:   number = target.armor !== -1 ? Math.min(target.armor, weapon_dmg) : weapon_dmg,
              health_deal:  number = this.weapon!.stats.bullet_dmg - armor_deal


        target.health -= health_deal
        target.armor  -= target.armor !== -1 ? armor_deal : 0

        return {
            dmgdealt: health_deal,
            killed:   target.health <= 0
        }
    }


    public set_health(v: number): void
    {
        this.health = v
    }


    public removeBullet(b: Entity, force?: boolean): void
    {
        const stats: EntityStats = b.getStats(),
              index: number      = this.shots.findIndex(x => x.obj.getStats().id === stats.id)


        if (index !== -1)
        {
            if (this.shots[index].type === 'explosive')
            {
                const obj: Entity = new Entity(stats.x + stats.w/2, stats.y, 20, 20, {image: '/data/explosion.svg'})

                this.gameobj?.audio?.('/data/weapons/sounds/explosion.wav')

                this.shots.push({obj, dir: 1, dirX: 0, dirY: 0, type: 'explosion', explosionObj: {
                    sizeStep: 8,
                    affected: [],
                    timeout: null
                }})
            }

            if (force || this.shots[index].type !== 'explosion')
                this.shots.splice(index, 1)
        }
    }


    public getWeaponDefaults(): Maybe<Weapon>
    {
        return this.weapon_def
    }


    public isShooter(): boolean
    {
        return !!this.weapon
    }


    public loadWeapon(): void
    {
        if (this.weapon_saved)
        {
            this.weapon     = this.weapon_copy(this.weapon_saved)
            this.weapon_def = this.weapon_copy(this.weapon_saved)
        }
    }


    public saveWeapon(): void
    {
        if (this.weapon)
            this.weapon_saved = this.weapon_copy(this.weapon)
    }


    public setWeaponStats(stat: WeaponStat, val: number | 'default'): void
    {
        if (!this.weapon) return

        if      (typeof val === 'number') this.weapon.stats[stat] = val
        else if (val === 'default')       this.weapon.stats[stat] = this.getWeaponDefaults()!.stats[stat]
    }


    public setWeapon(weapon: Weapon): void
    {
        clearTimeout(this.reload_timer)

        this.has_shot   = false
        this.weapon     = {...weapon, stats: {...weapon.stats}}
        this.weapon_def = {...weapon, stats: {...weapon.stats}}
    }


    public getWeapon(): Maybe<Weapon>
    {
        return this.weapon
    }


    public override getStats(): ActionStats
    {
        return {
            ...super.getStats(),
            health:     this.health,
            max_health: this.max_health,
            armor:      this.armor,
            max_armor:  this.max_armor,
            godmode:    this.godmode
        }
    }
}



export default Action