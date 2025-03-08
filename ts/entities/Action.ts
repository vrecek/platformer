import { Bullet, BulletDirection, Maybe, OptionalArgs } from "../../interfaces/EntityTypes.js";
import Entity from "./Entity.js";


abstract class Action extends Entity
{
    private has_shot:     boolean
    private shoot_cd:     number
    private bullet_cd:    number
    private bullet_dmg:   number
    private shots:        Bullet[]
    private bullet_speed: number

    protected health:   number
    protected last_dir: 'left' | 'right'


    protected constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        super(x, y, w, h, args)

        this.has_shot = false
        this.shots    = []
        this.last_dir = 'right'

        this.shoot_cd = args?.act_defaults?.shoot_cd ?? 500
        this.health   = args?.act_defaults?.health   ?? 10

        this.bullet_cd    = 2000
        this.bullet_speed = args?.act_defaults?.bullet_speed ?? 6
        this.bullet_dmg   = args?.act_defaults?.bullet_dmg   ?? 1
    }


    public shoot(): void
    {
        if (this.has_shot) return

        let x:   number          = this.x + this.w + 2, 
            img: string          = '/data/bullet_right.svg',
            dir: BulletDirection = 1


        if (this.last_dir === 'left')
        {
            dir = -1
            img = '/data/bullet_left.svg'
            x   = this.x - 2
        }

        const obj: Entity = new Entity(x, this.y, 20, 10, {image: img})

        this.has_shot = true
        this.shots.push({obj, dir})

        setTimeout(() => this.removeBullet(obj), this.bullet_cd)
        setTimeout(() => this.has_shot = false,  this.shoot_cd)
    }


    public getShots(): Bullet[]
    {
        return this.shots
    }


    public deal_damage(e: Action): boolean
    {
        e.health -= this.bullet_dmg

        return e.health <= 0
    }


    public drawShot(CTX: CanvasRenderingContext2D, b: Bullet): void
    {
        const {x, y} = b.obj.getStats()

        b.obj.setPosition(x + b.dir * this.bullet_speed, y)
        b.obj.draw(CTX)
    }


    public removeBullet(b: Entity): void
    {
        const i = this.shots.findIndex(x => x.obj.getStats().id === b.getStats().id)

        i !== -1 && this.shots.splice(i, 1)
    }


    public setAttackCooldown(v: number): void
    {
        this.shoot_cd = v
    }


    public setBulletSpeed(v: number): void
    {
        this.bullet_speed = v
    }


    public setAttackDamage(v: number): void
    {
        this.bullet_dmg = v
    }
}



export default Action