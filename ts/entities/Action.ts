import { CollisionCb, Maybe, OptionalArgs, Pos } from "../../interfaces/EntityTypes.js";
import Entity from "./Entity.js";


abstract class Action extends Entity
{
    private has_shot:     boolean
    private shoot_cd:     number
    private bullet_cd:    number
    private bullet_speed: number
    private bullet_dmg:   number
    private shots:        Entity[]

    protected health: number


    protected constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        super(x, y, w, h, args)

        this.has_shot = false
        this.shots    = []

        this.shoot_cd     = 500
        this.bullet_cd    = 2000
        this.bullet_speed = 6
        this.bullet_dmg   = 25

        this.health   = 100
    }


    public shoot(): void
    {
        if (this.has_shot) return

        const b: Entity = new Entity(this.x + this.w + 2, this.y, 20, 10, {image: '/data/bullet.svg'})

        this.has_shot = true
        this.shots.push(b)

        setTimeout(() => {
            this.removeBullet(b)

        }, this.bullet_cd);

        setTimeout(() => this.has_shot = false, this.shoot_cd);
    }


    public getShots(): Entity[]
    {
        return this.shots
    }


    public deal_damage(): boolean
    {
        this.health -= this.bullet_dmg

        return this.health <= 0
    }


    public drawShot(CTX: CanvasRenderingContext2D, b: Entity): void
    {
        const {x, y} = b.getStats()

        b.setPosition(x + this.bullet_speed, y)
        b.draw(CTX)
    }


    public removeBullet(b: Entity): void
    {
        const i = this.shots.findIndex(x => x.getStats().id === b.getStats().id)

        i !== -1 && this.shots.splice(i, 1)
    }
}



export default Action