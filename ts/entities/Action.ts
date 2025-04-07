import { Bullet, BulletDirection, DamageObject, EntityStats, FlameWeapon, Maybe, OptionalActionArgs, ShootDirection, ShotgunWeapon, Weapon, WeaponStat } from "../../interfaces/EntityTypes.js";
import { ActionStats } from "../../interfaces/PlayerTypes.js";
import Game from "../Game.js";
import Entity from "./Entity.js";


abstract class Action extends Entity
{
    private has_shot:     boolean
    private bullet_cd:    number
    private shots:        Bullet[]
    private reload_timer: number | undefined
    private godmode:      boolean

    protected weapon:       Maybe<Weapon>
    protected weapon_def:   Maybe<Weapon>
    protected weapon_saved: Maybe<Weapon>

    protected gameobj: Maybe<Game>

    protected health:     number
    protected def_health: number
    protected last_dir:   ShootDirection
    


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
        const obj: Entity = new Entity(x, this.y, 20, 10, {image: img})

        this.shots.push({obj, dir, dirX: 1, dirY: 0, type: 'regular'})
        
        setTimeout(() => this.removeBullet(obj), this.bullet_cd)
    }

    private shotgunBullet(x: number, img: string, dir: BulletDirection): void
    {
        const gun: ShotgunWeapon = this.weapon!.stats as ShotgunWeapon

        // for (let i = 0; i < gun.bullet_nr; i++)
        // {   
        //     const angle = i * gun.angle_step,
        //           obj   = new Entity(x, this.y, 20, 10, {image: img})


        //     this.shots.push({obj, dir, dirX: Math.cos(angle), dirY: Math.sin(angle), type: 'regular', rad:120,ang:angle })

        //     setTimeout(() => this.removeBullet(obj), this.bullet_cd)
        // }

        for (let i = 0; i < gun.bullet_nr; i++)
        {   
            const angle = gun.angle_start + i * gun.angle_step,
                  obj   = new Entity(x, this.y, 20, 10, {image: img})


            this.shots.push({obj, dir, dirX: Math.cos(angle), dirY: Math.sin(angle), type: 'regular' })

            setTimeout(() => this.removeBullet(obj), this.bullet_cd)
        }
    }

    private rocketBullet(x: number, img: string, dir: BulletDirection): void
    {
        const obj: Entity = new Entity(x, this.y, 50, 20, {image: img})

        this.shots.push({obj, dir, dirX: 1, dirY: 0, type: 'explosive'})
        
        setTimeout(() => this.removeBullet(obj), this.bullet_cd)
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

        this.shots.push({obj, dir, dirX: 1, dirY: 0, type: 'flamestream', flameObj: {
            affected: [],
            dmg_cooldown: 100
        }})
    }

    private weapon_copy(weapon: Maybe<Weapon>): Maybe<Weapon>
    {
        return weapon ? { ...weapon, stats: {...weapon.stats} } : null
    }


    protected constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalActionArgs>)
    {
        super(x, y, w, h, args)

        this.gameobj    = args?.act_defaults?.game

        this.has_shot   = false
        this.shots      = []
        this.last_dir   = args?.act_defaults?.direction ?? 'right'

        this.health     = args?.act_defaults?.health ?? 100
        this.def_health = this.health
        this.godmode    = args?.godmode ?? false

        this.bullet_cd    = 2000
        this.weapon       = this.weapon_copy(args?.act_defaults?.weapon)
        this.weapon_def   = this.weapon_copy(args?.act_defaults?.weapon)
        this.weapon_saved = this.weapon_copy(args?.act_defaults?.weapon)
    }


    public shoot(reloadCB?: () => void): boolean
    {
        if (this.has_shot || !this.weapon || this.weapon.is_reloading || !this.weapon.stats.mag_ammo) 
            return false


        switch (this.weapon.type)
        {
            case 'pistol':
            case 'smg':
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

        if (!this.weapon.inf_ammo && ! --this.weapon.stats.mag_ammo && this.weapon.stats.total_ammo)
            this.reload(reloadCB)


        this.has_shot = true
        setTimeout(() => this.has_shot = false, this.weapon.stats.shoot_cd)


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
                b.explosionObj.timeout = setTimeout(() => this.removeBullet(b.obj, true), 200)
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


    public reload(reloadCB?: () => void): void
    {
        if (
            this.weapon?.is_reloading || !this.weapon || !this.weapon.stats.total_ammo ||
            this.weapon.stats.mag_ammo === this.weapon_def?.stats.mag_ammo
        ) 
            return

        this.weapon.is_reloading = true
        this.gameobj?.audio?.('/data/weapons/sounds/reload.wav')

        this.reload_timer = setTimeout(() => {
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

            reloadCB?.()

        }, this.weapon.stats.reload_time)

        const id:  string = Game.generateID(),
              ctx: CanvasRenderingContext2D = this.gameobj!.getCtx()

        Game.addFunction(id, () => {
            if (!this.weapon?.is_reloading)
                Game.removeFunction(id) 

            ctx.font = "14px Verdana, Geneva, Tahoma, sans-serif"

            const text: string      = 'RELOADING',
                  size: TextMetrics = ctx.measureText(text),
                  posx: number      = this.x + (this.w - size.width) / 2

            ctx.fillStyle = "white"
            ctx.fillText(text, posx, this.y - 10)
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
              healthv: number = (w_def * this.health) / this.def_health,
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
            setTimeout(() => Game.removeFunction(id), 1000)

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
        else if (bullet?.type === 'flamestream' && bullet.flameObj)
        {
            if (bullet.flameObj.affected.includes(target.id))
                return returnObj

            bullet.flameObj.affected.push(target.id)

            setTimeout(() => {
                if (!bullet.flameObj) return

                const i: number = bullet.flameObj.affected.findIndex(x => x === target.id)

                if (i !== -1)
                    bullet.flameObj?.affected.splice(i, 1)
                
            }, bullet.flameObj.dmg_cooldown);
        }

        target.health -= this.weapon!.stats.bullet_dmg

        return {
            dmgdealt: this.weapon!.stats.bullet_dmg,
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
                    affected: []
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


    public loadWeapon(): void
    {
        if (this.weapon_saved)
            this.weapon = this.weapon_copy(this.weapon_saved)
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
            def_health: this.def_health,
            godmode:    this.godmode
        }
    }
}



export default Action