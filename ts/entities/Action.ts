import { Bullet, BulletDirection, EntityStats, HealthObject, Maybe, OptionalActionArgs, OptionalArgs, ShootDirection, ShotgunWeapon, Weapon, WeaponCommon, WeaponStat } from "../../interfaces/EntityTypes.js";
import { ActionStats } from "../../interfaces/PlayerTypes.js";
import Game from "../Game.js";
import Entity from "./Entity.js";


abstract class Action extends Entity
{
    private gameobj:      Maybe<Game>
    private has_shot:     boolean
    private bullet_cd:    number
    private shots:        Bullet[]

    private weapon:       Maybe<Weapon>
    private weapon_def:   Maybe<Weapon>
    private reload_timer: number | undefined

    private godmode:      boolean

    protected health:     number
    protected def_health: number
    protected last_dir:   ShootDirection


    private getBulletImage(type: 'bullet' | 'rocket', width: number): [number, string, BulletDirection]
    {
        let x:   number          = this.x + this.w + 2, 
            img: string          = `/data/${type}_right.svg`,
            dir: BulletDirection = 1


        if (this.last_dir === 'left')
        {
            dir = -1
            img = `/data/${type}_left.svg`
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

        this.bullet_cd  = 2000
        this.weapon     = args?.act_defaults?.weapon ? { ...args.act_defaults.weapon, stats: {...args.act_defaults.weapon.stats} } : null
        this.weapon_def = args?.act_defaults?.weapon ? { ...args.act_defaults.weapon, stats: {...args.act_defaults.weapon.stats} } : null
    }


    public shoot(reloadCB?: () => void): void
    {
        if (this.has_shot || !this.weapon || this.weapon.is_reloading || !this.weapon.stats.mag_ammo) 
            return


        switch (this.weapon.type)
        {
            case 'pistol':
            case 'smg':
                this.singleBullet(...this.getBulletImage('bullet', 20))
                break

            case 'rocketlauncher':
                this.rocketBullet(...this.getBulletImage('rocket', 50))
                break

            case 'shotgun':
                this.shotgunBullet(...this.getBulletImage('bullet', 20))
                break
            
            default: return
        }

        if (!this.weapon.inf_ammo && ! --this.weapon.stats.mag_ammo && this.weapon.stats.total_ammo)
            this.reload(reloadCB)

        this.gameobj?.audio?.(this.weapon.wav)
        this.has_shot = true

        setTimeout(() => this.has_shot = false,  this.weapon.stats.shoot_cd)
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
    }


    public addAmmo(count: number): void
    {
        if (!this.weapon) return

        this.weapon.stats.total_ammo = Math.min(this.weapon.stats.total_ammo + count, this.weapon.stats.max_ammo);
    }


    public reloadIndicator(ctx: CanvasRenderingContext2D): void
    {
        ctx.font = "14px Verdana, Geneva, Tahoma, sans-serif"

        const text: string      = 'RELOADING',
              size: TextMetrics = ctx.measureText(text),
              posx: number      = this.x + (this.w - size.width) / 2


        ctx.fillStyle = "white"
        ctx.fillText(text, posx, this.y - 10)
    }


    public deal_damage(target: Action, bullet?: Bullet): boolean
    {
        if (target.godmode)
            return false
        
        if (bullet?.type === 'explosion' && bullet.explosionObj)
        {
            const t_id: string = target.id

            if (bullet.explosionObj.affected.includes(t_id))
                return false
            
            bullet.explosionObj.affected.push(t_id)
        }

        target.health -= this.weapon!.stats.bullet_dmg

        return target.health <= 0
    }


    public set_health(v: number): void
    {
        this.health = v
    }


    public removeBullet(b: Entity, force?: boolean): void
    {
        const stats: EntityStats = b.getStats(),
              i: number          = this.shots.findIndex(x => x.obj.getStats().id === stats.id)


        if (i !== -1)
        {
            if (this.shots[i].type === 'explosive')
            {
                const obj: Entity = new Entity(stats.x + stats.w/2, stats.y, 20, 20, {image: '/data/explosion.svg'})

                this.gameobj?.audio?.('/data/weapons/sounds/explosion.wav')

                this.shots.push({obj, dir: 1, dirX: 0, dirY: 0, type: 'explosion', explosionObj: {
                    sizeStep: 8,
                    affected: []
                }})
            }

            if (force || this.shots[i].type !== 'explosion')
                this.shots.splice(i, 1)
        }
    }


    public getWeaponDefaults(): Maybe<Weapon>
    {
        return this.weapon_def
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