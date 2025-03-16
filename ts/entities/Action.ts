import { Bullet, BulletDirection, HealthObject, Maybe, OptionalArgs, ShootDirection, ShotgunWeapon, Weapon, WeaponStat } from "../../interfaces/EntityTypes.js";
import { ActionStats } from "../../interfaces/PlayerTypes.js";
import Entity from "./Entity.js";
import WeaponItem from "./WeaponItem.js";


abstract class Action extends Entity
{
    private has_shot:     boolean
    private bullet_cd:    number
    private shots:        Bullet[]

    private weapon:       Weapon | null
    private weapon_def:   Weapon | null

    protected health:     number
    protected def_health: number
    protected last_dir:   ShootDirection
    

    private pistolBullet(x: number, img: string, dir: BulletDirection): void
    {
        const obj: Entity = new Entity(x, this.y, 20, 10, {image: img})

        this.shots.push({obj, dir, dirX: 1, dirY: 0})
        
        setTimeout(() => this.removeBullet(obj), this.bullet_cd)
    }

    private shotgunBullet(x: number, img: string, dir: BulletDirection): void
    {
        const gun: ShotgunWeapon = this.weapon!.stats as ShotgunWeapon

        for (let i = 0; i < gun.bullet_nr; i++)
        {   
            const angle = gun.angle_start + i * gun.angle_step,
                  obj   = new Entity(x, this.y, 20, 10, {image: img})


            this.shots.push({obj, dir, dirX: Math.cos(angle), dirY: Math.sin(angle) })

            setTimeout(() => this.removeBullet(obj), this.bullet_cd)
        }
    }


    protected constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        super(x, y, w, h, args)

        this.has_shot = false
        this.shots    = []
        this.last_dir = args?.act_defaults?.direction ?? 'right'

        this.health     = args?.act_defaults?.health ?? 100
        this.def_health = this.health
        this.bullet_cd  = 2000

        this.weapon     = args?.act_defaults?.weapon ? { ...args.act_defaults.weapon, stats: {...args.act_defaults.weapon.stats} } : null
        this.weapon_def = args?.act_defaults?.weapon ? { ...args.act_defaults.weapon, stats: {...args.act_defaults.weapon.stats} } : null
    }


    public shoot(): void
    {
        if (this.has_shot || !this.weapon) 
            return

        let x:   number          = this.x + this.w + 2, 
            img: string          = '/data/bullet_right.svg',
            dir: BulletDirection = 1


        if (this.last_dir === 'left')
        {
            dir = -1
            img = '/data/bullet_left.svg'
            x   = this.x - 20
        }


        switch (this.weapon.type)
        {
            case 'pistol':
                this.pistolBullet(x, img, dir)
                break

            case 'shotgun':
                this.shotgunBullet(x, img, dir)
                break
            
            default: return
        }

        this.has_shot = true
        setTimeout(() => this.has_shot = false,  this.weapon.stats.shoot_cd)
    }


    public drawShot(CTX: CanvasRenderingContext2D, b: Bullet): void
    {
        const {x, y} = b.obj.getStats()

        b.obj.setPosition(
            x + (b.dir * b.dirX) * this.weapon!.stats.bullet_speed, 
            y + b.dirY * this.weapon!.stats.bullet_speed
        )
        b.obj.draw(CTX)
    }


    public getShots(): Bullet[]
    {
        return this.shots
    }


    public deal_damage(target: Action): boolean
    {
        target.health -= this.weapon!.stats.bullet_dmg

        return target.health <= 0
    }


    public set_health(v: number): void
    {
        this.health = v
    }


    public get_health(): HealthObject
    {
        return {
            current: this.health,
            default: this.def_health
        }
    }


    public removeBullet(b: Entity): void
    {
        const i = this.shots.findIndex(x => x.obj.getStats().id === b.getStats().id)

        i !== -1 && this.shots.splice(i, 1)
    }


    public getWeaponDefaults(): Weapon | null
    {
        if (!this.weapon_def) return null

        return {
            ...this.weapon_def,
            stats: {
                bullet_dmg:   this.weapon_def.stats.bullet_dmg,
                bullet_speed: this.weapon_def.stats.bullet_speed,
                shoot_cd:     this.weapon_def.stats.shoot_cd
            }
        }
    }


    public setWeaponStats(stat: WeaponStat, val: number | 'default'): void
    {
        if (!this.weapon) return

        if      (typeof val === 'number') this.weapon.stats[stat] = val
        else if (val === 'default')       this.weapon.stats[stat] = this.getWeaponDefaults()!.stats[stat]
    }


    public setWeapon(weapon: Weapon): void
    {
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
            def_health: this.def_health
        }
    }
}



export default Action